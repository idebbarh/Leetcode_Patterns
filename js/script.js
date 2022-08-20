//Selectors
const mainApp = document.querySelector("#app"),
  openNavBarBtn = document.querySelector(".open-mobile-menu-bar-btn"),
  closeNavBarBtn = document.querySelector(".close-mobile-menu-bar-btn"),
  headerNavBar = document.querySelector(".header-contents"),
  openRandomProbBtn = document.querySelector(".pick-rand-btn"),
  showGroupsBtns = document.querySelectorAll(".show-groups-btns button"),
  solvingProgress = document.querySelector(".solving-progress"),
  problemesGroupsDiff = document.querySelector(".problmes-groups.diff"),
  problemesGroupsCat = document.querySelector(".problmes-groups.cat"),
  problemesGroupsRand = document.querySelector(".problmes-groups.rand"),
  problemesGroupsFav = document.querySelector(".problmes-groups.fav");
//events:
//to open the menu:
openNavBarBtn.addEventListener("click", () => {
  document.getElementsByTagName("body")[0].style.overflowY = "hidden";
  document.getElementsByTagName("html")[0].style.overflowY = "hidden";
  headerNavBar.style.transform = "translateX(0%)";
});
//to close the menu:
closeNavBarBtn.addEventListener("click", () => {
  document.getElementsByTagName("body")[0].style.overflowY = "visible";
  document.getElementsByTagName("html")[0].style.overflowY = "visible";
  headerNavBar.style.transform = "translateX(-100%)";
});
//to open random probleme
openRandomProbBtn.addEventListener("click", () => {
  let randomIndex = Math.trunc(Math.random() * problemesData.length);
  let problemLink = problemesData[randomIndex].link;
  window.open(problemLink, "_blank");
});
//to open the problemes in specific groups:
showGroupsBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    headerNavBar.style.transform = "translateX(-100%)";
    document.getElementsByTagName("body")[0].style.overflowY = "visible";
    document.getElementsByTagName("html")[0].style.overflowY = "visible";
    let oldActiveBtn = btn.parentElement.querySelector(".active");
    let activeGroupsContainer = document.querySelector(
      ".main-contents .problmes-groups.active"
    );
    oldActiveBtn.classList.remove("active");
    btn.classList.add("active");
    if (btn.classList.contains("g-diff-btn")) {
      generateByDiff();
      activeGroupsContainer.classList.remove("active");
      problemesGroupsDiff.classList.add("active");
    } else if (btn.classList.contains("g-categ-btn")) {
      generateByCat();
      activeGroupsContainer.classList.remove("active");
      problemesGroupsCat.classList.add("active");
    } else if (btn.classList.contains("g-rand-btn")) {
      generateRandomly();
      activeGroupsContainer.classList.remove("active");
      problemesGroupsRand.classList.add("active");
    } else {
      generateByFav();
      activeGroupsContainer.classList.remove("active");
      problemesGroupsFav.classList.add("active");
    }
  });
});
//functions:
let cards = [];
//make probleme card function
function makeCard(index, prb) {
  //create card elem
  let card = document.createElement("div");
  card.classList.add("prob-card");
  card.classList.add(`${prb.difficulty.toLowerCase()}`);
  card.setAttribute("data-index", index);
  //add the elems
  card.innerHTML = `<div class="check-box">
                        <div class="cercle"></div>
                        </div>
                        <a href="${prb.link}" class="prob-title" target="_blank"><h4>${prb.title}</h4></a>
                        <div class="prob-diff"><span>${prb.difficulty}</span></div>
                        <div><i class="fa-solid fa-star add-to-fav-btn"></i></div>
                        <div class="hover-color"></div>`;
  //check box elem;
  let checkBoxElem = card.querySelector(".check-box .cercle");
  //add check box even.
  checkBoxElem.addEventListener("click", () => {
    checkBoxElem.classList.toggle("active");
    card.classList.toggle("complete");
    //update progress
    updateTheProgress();
    //add the solved problem to the localstorage
    if (localStorage.getItem("solProblemes")) {
      let data = JSON.parse(localStorage.getItem("solProblemes"));
      if (card.classList.contains("complete")) {
        data.push(index);
      } else {
        let updatedData = data.filter((item) => {
          return item !== index;
        });
        data = updatedData;
      }
      localStorage.setItem("solProblemes", JSON.stringify(data));
    } else {
      localStorage.setItem("solProblemes", JSON.stringify([index]));
    }
  });
  //fav icon elem
  let favIcon = card.querySelector(".add-to-fav-btn");
  //add active class to btn
  favIcon.addEventListener("click", () => {
    let cardParent = card.parentElement;
    favIcon.classList.toggle("active");
    //add fav prob in the loacal storage
    if (localStorage.getItem("favProblemes")) {
      let data = JSON.parse(localStorage.getItem("favProblemes"));
      if (favIcon.classList.contains("active")) {
        data.push(index);
      } else {
        let updatedData = data.filter((item) => {
          return item !== index;
        });
        data = updatedData;
      }
      localStorage.setItem("favProblemes", JSON.stringify(data));
    } else {
      localStorage.setItem("favProblemes", JSON.stringify([index]));
    }
    checkIfFavProb();
    if (cardParent.classList.contains("fav")) {
      if (cardParent.previousElementSibling.classList.contains("diff")) {
        generateByDiff();
      } else if (cardParent.previousElementSibling.classList.contains("cat")) {
        generateByCat();
      } else {
        generateRandomly();
      }
      generateByFav();
    }
  });
  return card;
}
//sort the problemes by diff after make cardes.
function sortByDiff(){
  //put the easy first :
  for(let i = 0 ; i < problemesData.length; i++){
    let tmp = null;
    for(let j = i+1; j < problemesData.length; j++){
      if(problemesData[i].difficulty !== "Easy" && problemesData[j].difficulty === "Easy"){
        tmp = problemesData[i]
        problemesData[i] = problemesData[j]
        problemesData[j] = tmp;
      }
    }
  }
  //followed by Medium
  for(let i = 0 ; i < problemesData.length; i++){
    let tmp = null;
    for(let j = i+1; j < problemesData.length; j++){
      if(problemesData[i].difficulty === "Hard" && problemesData[j].difficulty === "Medium"){
        tmp = problemesData[i];
        problemesData[i] = problemesData[j];
        problemesData[j] = tmp;
      }
    }
  }
}
sortByDiff();
//makes cards :
problemesData.forEach((prob, indx) => {
  cards.push(makeCard(indx, prob));
});
//generate cards by Category
function generateByCat() {
  //remove the html form the groups container.
  problemesGroupsCat.innerHTML = "";
  let groupsTitles = [];
  problemesData.forEach((prob) => {
    if (!groupsTitles.includes(prob.pattern)) {
      groupsTitles.push(prob.pattern);
    }
  });
  groupsTitles.forEach((t) => {
    let group = document.createElement("div");
    let numOfProbInGroup = 0;
    group.classList.add("group");
    group.innerHTML = `<h2 class="group-title">
                            <span class="title">${t}</span> (<span class="sol-num"></span>/<span class="prob-num"></span>)
                        </h2>`;
    cards.forEach((card, index) => {
      if (problemesData[index].pattern === t) {
        group.appendChild(card);
        numOfProbInGroup += 1;
      }
    });
    let groupProbNumElem = group.querySelector(".group-title .prob-num");
    groupProbNumElem.innerText = numOfProbInGroup;
    problemesGroupsCat.appendChild(group);
  });
  updateTheProgress();
}
generateByCat();
//generate problemes by difficulty
function generateByDiff() {
  //remove the html form the groups container.
  problemesGroupsDiff.innerHTML = "";
  let groupsTitles = [];
  problemesData.forEach((prob) => {
    if (!groupsTitles.includes(prob.difficulty)) {
      groupsTitles.push(prob.difficulty);
    }
  });
  groupsTitles.forEach((t) => {
    let group = document.createElement("div");
    let numOfProbInGroup = 0;
    group.classList.add("group");
    group.innerHTML = `<h2 class="group-title">
                            <span class="title">${t}</span> (<span class="sol-num"></span>/<span class="prob-num"></span>)
                        </h2>`;
    cards.forEach((card, index) => {
      if (problemesData[index].difficulty === t) {
        group.appendChild(card);
        numOfProbInGroup += 1;
      }
    });
    let groupProbNumElem = group.querySelector(".group-title .prob-num");
    groupProbNumElem.innerText = numOfProbInGroup;
    problemesGroupsDiff.appendChild(group);
  });
  updateTheProgress();
}
//generate problemes Randomly.
function generateRandomly() {
  let indexes = [];
  while (indexes.length < cards.length) {
    let randIndx = Math.trunc(Math.random() * cards.length);
    if (!indexes.includes(randIndx)) {
      problemesGroupsRand.appendChild(cards[randIndx]);
      indexes.push(randIndx);
    }
  }
}
//generate problemes by favorite
function generateByFav() {
  if (localStorage.getItem("favProblemes")) {
    //remove the html from the groups container.
    problemesGroupsFav.innerHTML = "";
    let data = JSON.parse(localStorage.getItem("favProblemes"));
    data.forEach((index) => {
      problemesGroupsFav.appendChild(cards[index]);
    });
  }
}
//update local storage items:
function updateLocalStorageItems() {
  //update the solved problemes.
  if (localStorage.getItem("solProblemes")) {
    let data = JSON.parse(localStorage.getItem("solProblemes"));
    data.forEach((index) => {
      let solvedItem = document.querySelector(`[data-index="${index}"]`);
      let checkBox = solvedItem.querySelector(".check-box .cercle");
      checkBox.classList.add("active");
      solvedItem.classList.add("complete");
    });
  }
  //update the fav problemes.
  if (localStorage.getItem("favProblemes")) {
    let data = JSON.parse(localStorage.getItem("favProblemes"));
    data.forEach((index) => {
      let favItem = document.querySelector(`[data-index="${index}"]`);
      let favIcon = favItem.querySelector(".add-to-fav-btn");
      favIcon.classList.add("active");
    });
  }
}
updateLocalStorageItems();
//update the solving progress
function updateTheProgress() {
  let numOfSolInAll = document.querySelectorAll(".complete").length;
  let allGroups = document.querySelectorAll(".group");
  let allSolNum = solvingProgress.querySelector(".all-sol-num");
  let totalProb = solvingProgress.querySelector(".total-prob");
  let progressBar = solvingProgress.querySelector(
    ".progress-container .progress-bar"
  );
  let progressBarValue = solvingProgress.querySelector(
    ".progress-container .progress-value"
  );
  //set the total problemes number:
  totalProb.innerText = problemesData.length;
  //update the number of solved problems.
  //in group.
  allGroups.forEach((group) => {
    let groupSolNum = group.querySelector(".group-title .sol-num");
    let numOfSolInGroup = group.querySelectorAll(".complete").length;
    groupSolNum.innerText = numOfSolInGroup;
  });
  //in all.
  allSolNum.innerText = numOfSolInAll;
  //update the progress bar
  progressBar.style.width = `calc(calc(100% / ${problemesData.length}) * ${numOfSolInAll})`;
  let valProgress = ((100 / problemesData.length) * numOfSolInAll).toFixed(2);
  progressBarValue.innerText = `${valProgress}%`;
}
updateTheProgress();
//check if favorite problemes
function checkIfFavProb() {
  let favProbsBtn = document
    .querySelector(".show-groups-btns")
    .querySelector(".g-fav-btn");
  let activeGroupsContainer = document.querySelector(
    ".main-contents .problmes-groups.active"
  );
  if (JSON.parse(localStorage.getItem("favProblemes"))) {
    let data = JSON.parse(localStorage.getItem("favProblemes"));
    if (data.length > 0) {
      favProbsBtn.style.display = "block";
      //update the html only if the active group is fav.
      if (activeGroupsContainer.classList.contains("fav")) {
        generateByFav();
      }
    } else {
      favProbsBtn.style.display = "none";
      if (activeGroupsContainer.classList.contains("fav")) {
        let prevGroups = activeGroupsContainer.previousElementSibling;
        let prevBtn = favProbsBtn.previousElementSibling;
        activeGroupsContainer.classList.remove("active");
        favProbsBtn.classList.remove("active");
        prevGroups.classList.add("active");
        prevBtn.classList.add("active");
      }
    }
  } else {
    favProbsBtn.style.display = "none";
  }
}
checkIfFavProb();