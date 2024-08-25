function searchCall(event){
    event.preventDefault();
    const queryInput = $("#searchQueryInput").val();
    if (queryInput != ""){
        var variables = {
            categorySlug:"",
            skip:0,
            limit:10,
            filters:{
                searchKeywords: queryInput
            }
        };
        getProblems(variables).then(function(response){

            let data = {};
            let problems = response['data']['problemsetQuestionList']['questions']
            problems.forEach(problem=>{
                data[problem['titleSlug']] = [problem['title'] , problem['difficulty'], problem['acRate']]
                topicTags = problem['topicTags'];
                topicTags.forEach(tag=>{
                    data[problem['titleSlug']].push(tag['name'])
                })
            })
            
            const productList = document.querySelector(".problemList");
            productList.innerHTML = "";
            problems.forEach(problem => {
                if (problem['paidOnly'] == false){
                    const problemElement = createProblemElement(problem);
                    productList.appendChild(problemElement);
                }
            });
        });
    }
}
function createProblemElement(problem){
    const problemDiv = document.createElement('div');
    problemDiv.classList.add('problem');

    let tagsHTML = "";
    let count=0;
    problem['topicTags'].forEach(tag=>{
        if (count<3){
            tagsHTML+= `<span class='tag'>${tag['name']}</span>`;
            count++;
        }
    });
    let truncatedTitle=problem['title'];
    if (truncatedTitle.length >33 ){
        truncatedTitle = truncatedTitle.slice(0,33)+"...";
    }
    problemDiv.innerHTML = `
            <h3 class="problemTitle">${problem['title']}</h3>
            <div class="details">
                <p>Difficulty: <span class="difficulty">${problem.difficulty}</span></p>
                <p>Accuracy: <span class="accuracy">${parseFloat(problem.acRate.toFixed(2))}%</span></p>
            </div>
            <div class="tags">
                ${tagsHTML}
            </div>
    `
    console.log(problemDiv);
    return problemDiv;

}


function getProblems(variables){
    var query = `
                query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
                    problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
                        total: totalNum
                        questions: data {
                            acRate
                            difficulty
                            freqBar
                            frontendQuestionId: questionFrontendId
                            isFavor
                            paidOnly: isPaidOnly
                            status
                            title
                            titleSlug
                            topicTags {
                                name
                                id
                                slug
                            }
                            hasSolution
                            hasVideoSolution
                        }
                    }
                }
            `;
    return $.ajax({
        url: 'http://localhost:3000/leetcode',
        type:'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            query:query,
            variables: variables,
            operationName: "problemsetQuestionList"
        })
    });
}
document.getElementById('filter').addEventListener('click', function(event){
    conosle.log("clicked");
    const filterDiv = document.getElementById('allFilters');
    if (filterDiv.classList.exists('hidden')){
        filterDiv.classList.remove('hidden');
    }
    else{
        filterDiv.classList.add('hidden');
    }
})

const cycle = ['easy', 'medium', 'hard'];
let currentIndex = 1;

function changeDifficulty(direction){
    if (direction === 'previous' && currentIndex>0){
        currentIndex--;
    }
    else if (direction === "next" && currentIndex<2){
        currentIndex++;
    }
    document.getElementById("current").textContent = cycle[currentIndex];
    document.getElementById("previous").textContent = currentIndex>0 ? cycle[currentIndex-1] : "";
    document.getElementById("next").textContent = currentIndex<2 ? cycle[currentIndex+1] : "";
}

document.getElementById('difficultyDiv').addEventListener('wheel', function(event) {
  const main = document.getElementById('current');
    if (event.deltaY > 0 && main.textContent != cycle[2]) {
        currentIndex = (currentIndex + 1) % cycle.length;
    } else if (event.deltaY < 0 && main.textContent != cycle[0]) {
        currentIndex = (currentIndex - 1 + cycle.length) % cycle.length;
    }
    
    main.textContent = cycle[currentIndex];
    document.getElementById("previous").textContent = currentIndex > 0 ? cycle[currentIndex - 1] : "";
    document.getElementById("next").textContent = currentIndex < cycle.length - 1 ? cycle[currentIndex + 1] : "";
});