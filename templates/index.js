let display = document.getElementById("display");
let tokenList = document.createElement("div");
tokenList.id = "token-list";
document.querySelector(".calculator-section").appendChild(tokenList);

let tokenCounts = document.createElement("div");
tokenCounts.id = "token-counts";
document.querySelector(".calculator-section").appendChild(tokenCounts);

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
  tokenList.innerHTML = "";
  tokenCounts.innerHTML = "";
}

function backspace() {
  if (display.innerText.length === 1) {
    display.innerText = "0";
  } else {
    display.innerText = display.innerText.slice(0, -1);
  }
}

function saveToMemory() {
  const value = parseFloat(display.innerText);
  fetch("/memory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ operation: "MS", value: value }),
  });
}

function recallMemory() {
  fetch("/memory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ operation: "MR" }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.value !== null) {
        display.innerText = data.value;
      }
    });
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
        display.innerText = data.resultado;
        drawTree(data.arbol);
        displayTokens(data.tokens);
        displayTokenCounts(data.conteo_tokens);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      display.innerText = "Error";
    });
}

function displayTokens(tokens) {
  tokenList.innerHTML = "<h3>Lista de Tokens</h3>";
  const tokenTable = document.createElement("table");
  tokenTable.className = "token-table";
  tokenTable.innerHTML = `
    <tr>
      <th>Tipo</th>
      <th>Valor</th>
    </tr>
    ${tokens.map((token, index) => `
      <tr style="--index: ${index}">
        <td>${token.tipo}</td>
        <td>${token.valor}</td>
      </tr>
    `).join("")}
  `;
  tokenList.appendChild(tokenTable);
}

function displayTokenCounts(counts) {
  tokenCounts.innerHTML = `
    <h3>Conteo de Tokens</h3>
    <p>Total de números: ${counts.numeros}</p>
    <p>Total de operadores: ${counts.operadores}</p>
  `;
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

  nodeGroups
    .append("circle")
    .attr("r", 20)
    .attr("class", "node-circle")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 25);
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 20);
    });

  nodeGroups
    .append("text")
    .attr("dy", ".35em")
    .attr("x", (d) => (d.children ? -30 : 30))
    .attr("text-anchor", (d) => (d.children ? "end" : "start"))
    .text((d) => {
      const operatorMap = {
        '+': '+',
        '-': '-',
        '*': '×',
        '/': '÷'
      };
      return operatorMap[d.data.value] || d.data.value;
    })
    .style("font-size", "14px")
    .style("fill", "white")
    .style("font-family", "'JetBrains Mono', monospace");

  nodeGroups
    .transition()
    .duration(800)
    .delay((d, i) => i * 100)
    .style("opacity", 1);

  nodeGroups
    .append("title")
    .text(d => {
      if (d.children) {
        return `Operador: ${d.data.value}`;
      } else {
        return `Valor: ${d.data.value}`;
      }
    });
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

document.addEventListener('keydown', (event) => {
  const key = event.key;
  
  if (/^[0-9+\-*/.()]$/.test(key)) {
    event.preventDefault();
    addToDisplay(key === '*' ? '×' : key);
  }
  else if (key === 'Enter') {
    event.preventDefault();
    calculate();
  }
  else if (key === 'Backspace') {
    event.preventDefault();
    backspace();
  }
  else if (key === 'Escape') {
    event.preventDefault();
    clearDisplay();
  }
});