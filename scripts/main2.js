function searchCall(event){
    event.preventDefault();
    if (!navigator.onLine){
        alert('No Internet Connection');
        return;
    }

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
            const problemList = document.querySelector("#problemList");
            problemList.innerHTML = "";
            problems.forEach(problem => {
                if (problem['paidOnly'] == false){
                    let tagsHTML = "";
                    let count=0;
                    problem['topicTags'].forEach(tag=>{
                        if (count<3){
                            tagsHTML += `
                            <span class="bg-gray-300 text-gray-900 text-xs py-1 px-2 rounded-md mr-1">
                                ${tag['name']}
                            </span>`
                            count++;
                        }
                    });
                    let truncatedTitle = problem['title'];
                    if (truncatedTitle.length > 36 ){
                        truncatedTitle = truncatedTitle.slice(0,33)+"...";
                    }
                    if (problem['acRate']<=33){
                        acColor="green";
                    }
                    else if (problem['acRate']>33 && problem['acRate']<=66){
                        acColor="yellow";
                    }
                    else{
                        acColor="red";
                    }
                    if (problem['difficulty']==='Easy'){
                        diffColor="green";
                    }
                    else if (problem['difficulty'] === 'Medium'){
                        diffColor="yellow";
                    }
                    else{
                        diffColor="red";
                    }

                    problemList.innerHTML += `
                        <div onclick="redirectToProblem(event)" titleSlug="${problem['titleSlug']}" class="bg-gray-100 rounded-lg overflow-hidden cursor-pointer mt-4">
                            <div id="problem"class="flex items-center justify-between bg-gray-200 rounded-t-lg px-4 py-2">
                                <input type="checkbox" onchange="updateLocalStorage(event)" class="mr-4">
                                <h3 class="text-gray-900 text-left flex-1">${truncatedTitle}</h3>
                                <div class="flex-1 flex justify-center items-center">
                                    <p class="text-sm text-gray-600">Difficulty: <span
                                            class="text-${diffColor}-500">${problem['difficulty']}</span></p>
                                    <p class="text-sm text-gray-600 ml-2">Accuracy: <span
                                            class="text-${acColor}-500">${parseFloat(problem['acRate'].toFixed(2))}%</span></p>
                                </div>
                                <div class="flex-1 flex justify-end">
                                    ${tagsHTML}
                                </div>
                            </div>
                        </div>
                    `
                }
            });
        });
    }
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

function redirectToProblem(event, title){
    if (event.target.type!=='checkbox'){
        const problem = event.currentTarget.getAttribute('titleSlug');
        var url = "https://leetcode.com/problems/"+problem+"/description/";
    
        window.open(url, '_blank');    
    }
    
}

function updateLocalStorage(event){
    const checkbox = event.target;
    const problemSlug = checkbox.closest('[titleSlug]').getAttribute('titleSlug');
    let selectedProblems = JSON.parse(localStorage.getItem('selectedProblems')) || [];
    if (checkbox.checked){
        if (!selectedProblems.includes(problemSlug)){
            selectedProblems.push(problemSlug);
        }
    } else{
        selectedProblems = selectedProblems.filter(slug => slug != problemSlug);
    }

    localStorage.setItem('selectedProblems', JSON.stringify(selectedProblems));
}
function toggleDarkMode(newState){
    if (newState=="on"){
        DarkReader.setFetchMethod(window.fetch);
        DarkReader.enable();
    }
    else{
        DarkReader.disable();
    }
}
toggleDarkMode("on");

document.getElementById('filter').addEventListener('click', function(event){
    console.log("clicked");
    const filterDiv = document.getElementById('allFilters');
    if (filterDiv.classList.contains('hidden')){
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

$('#difficultyDiv').on('click mouseenter', function(){
    $('#previous').toggleClass('hidden');
    $('#next').toggleClass('hidden');
})

$('#dropdown-button').on('click mouseenter', function() {
    $('#dropdown-menu').toggleClass('hidden');
});

$('#accSlider').on('input ', function(){
    const sliderVal = $(this).val();
    $('#accValue').text(sliderVal+"%")
});
$('#filterCall').on('click', function(){
    $('#allFilters').toggle('hide');
});