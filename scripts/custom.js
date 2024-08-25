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

            let problems = response['data']['problemsetQuestionList']['questions']
            
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
    let titleTruncated = problem['title'].length > 36 ? problem['title'].slice(0, 33)+"..." : problem['title'];
    problemDiv.innerHTML = `
            <h3 class="problemTitle">${titleTruncated}</h3>
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

function redirectLeetcode(problem){
    let url = "https://leetcode.com/problems/"+problem+"/description";
    window.open(url, '/blank');
}
