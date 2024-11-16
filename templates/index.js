let display = document.getElementById("display");

function addToDisplay(value) {
  if (display.innerText === "0") {
    display.innerText = value;
  } else {
    display.innerText += value;
  }
  display.style.transform = "scale(1.02)";
  setTimeout(() => {
    display.style.transform = "scale(1)";
  }, 100);
}

function clearDisplay() {
  display.innerText = "0";
  d3.select("#tree-container").selectAll("*").remove();
}

function calculate() {
  const expression = display.innerText;
  fetch("/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expression: expression }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        display.innerText = "Error";
      } else {
        display.innerText = data.result;
        drawTree(data.tree);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      display.innerText = "Error";
    });
}

function drawTree(treeData) {
  d3.select("#tree-container")
    .selectAll("*")
    .transition()
    .duration(300)
    .style("opacity", 0)
    .remove();

  if (!treeData) return;

  const container = document.getElementById("tree-container");
  const width = container.clientWidth;
  const height = container.clientHeight;
  const margin = { top: 40, right: 90, bottom: 50, left: 90 };

  const svg = d3
    .select("#tree-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tree = d3
    .tree()
    .size([
      height - margin.top - margin.bottom,
      width - margin.left - margin.right,
    ]);

  const root = d3.hierarchy(treeData);

  tree(root);

  const link = svg
    .selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr(
      "d",
      d3
        .linkHorizontal()
        .x((d) => d.y)
        .y((d) => d.x)
    )
    .style("opacity", 0)
    .transition()
    .duration(800)
    .style("opacity", 1);

  const nodeGroups = svg
    .selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d) => `translate(${d.y},${d.x})`)
    .style("opacity", 0);

  nodeGroups.append("circle").attr("r", 20).attr("class", "node-circle");

  nodeGroups
    .append("text")
    .attr("dy", ".35em")
    .attr("x", (d) => (d.children ? -30 : 30))
    .attr("text-anchor", (d) => (d.children ? "end" : "start"))
    .text((d) => d.data.value)
    .style("font-size", "14px")
    .style("fill", "white");

  nodeGroups
    .transition()
    .duration(800)
    .delay((d, i) => i * 100)
    .style("opacity", 1);
}

window.addEventListener("resize", () => {
  const treeData = document.querySelector("#tree-container svg");
  if (treeData) {
    const expression = display.innerText;
    if (expression !== "0" && expression !== "Error") {
      calculate();
    }
  }
});
