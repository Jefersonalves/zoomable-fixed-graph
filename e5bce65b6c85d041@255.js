// https://observablehq.com/@jefersonalves/zoomable-fixed-graph-with-images@255
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["graph@2.json",new URL("./files/384e6eb8252d4d821685ec3f889e94e525ae2bb5398b5f4709c259b6a2d53b85d58bbff0a4b7509d8db6ecd5cab03c8b5ca50a24a38650f9993a8f5b4852934c",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Zoomable Fixed Graph with Images

The graph allows zooming using the mouse or touch.`
)});
  main.variable(observer("viewof reset")).define("viewof reset", ["html"], function(html){return(
html`<button>Reset`
)});
  main.variable(observer("reset")).define("reset", ["Generators", "viewof reset"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["data","d3","width","height","x","combined","y","xAxis","yAxis","grid"], function(data,d3,width,height,x,combined,y,xAxis,yAxis,grid)
{
  const links = data.links;
  const nodes = data.nodes;
  
  const zoom = d3.zoom()
      .scaleExtent([0.5, 32])
      .on("zoom", zoomed);

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  const gGrid = svg.append("g");

  const link = svg.append("g")
      .attr("stroke", "#ccc")
      .attr("stroke-opacity", 0.3)
    .selectAll("line")
    .data(links)
    .enter().append("line")
        .attr("x1", d => x(combined[d.source].x))
        .attr("y1", d => y(combined[d.source].y))
        .attr("x2", d => x(combined[d.target].x))
        .attr("y2", d => y(combined[d.target].y));
  
    const defs = svg.append("defs")
    .selectAll("pattern")
    .data(nodes)
    .enter()
      .append("pattern")
      .attr("id", d => d.id)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("patternContentUnits", "objectBoundingBox")
      .append("image")
        .attr("width", 1)
        .attr("height", 1)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", d => d.attributes.imageurl);
  
  const gDot = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-linecap", "round")
      .selectAll(".node")
      .data(nodes)
        .enter()
        .append('g')

  const circles = gDot
    .append("circle")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("fill", d => "url(#"+d.id+")")

  const gx = svg.append("g");
  const gy = svg.append("g");

  svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

  function zoomed() {
    const transform = d3.event.transform;
    const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
    const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
    circles.attr("transform", transform).attr("r", d => d.size*3 / transform.k);
    link.attr("transform", transform).attr("stroke-width", 2.5 / transform.k);
    gx.call(xAxis, zx);
    gy.call(yAxis, zy);
    gGrid.call(grid, zx, zy);
  }

  return Object.assign(svg.node(), {
    reset() {
      svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);
    }
  });
}
);
  main.variable(observer()).define(["reset","chart"], function(reset,chart){return(
reset, chart.reset()
)});
  main.variable(observer("data")).define("data", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("graph@2.json").json()
)});
  main.variable(observer("nodes_pos")).define("nodes_pos", ["data"], function(data){return(
data.nodes.map(d => [d.x, d.y, d["attributes"]["Modularity Class"]])
)});
  main.variable(observer("combined")).define("combined", ["data"], function(data)
{
  const position_list = data.nodes.map(d => ({"x": d.x, "y": d.y}))
  const id_list = data.nodes.map(d => d.id)
  
  let combined = Object.create({})
  id_list.map((d, i) => combined[d] = position_list[i])
  
  return combined
}
);
  main.variable(observer("x")).define("x", ["d3","nodes_pos","width"], function(d3,nodes_pos,width){return(
d3.scaleLinear()
    .domain(d3.extent(nodes_pos, d => d[0])).nice()
    .rangeRound([0, width])
)});
  main.variable(observer("y")).define("y", ["d3","nodes_pos","height"], function(d3,nodes_pos,height){return(
d3.scaleLinear()
    .domain(d3.extent(nodes_pos, d => d[1])).nice()
    .rangeRound([height, 0])
)});
  main.variable(observer("z")).define("z", ["d3","nodes_pos"], function(d3,nodes_pos){return(
d3.scaleOrdinal()
    .domain(nodes_pos.map(d => d[2]))
    .range(d3.schemeCategory10)
)});
  main.variable(observer("xAxis")).define("xAxis", ["height","d3"], function(height,d3){return(
(g, x) => g
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisTop(x).ticks(12))
    .call(g => g.select(".domain").attr("display", "none"))
)});
  main.variable(observer("yAxis")).define("yAxis", ["d3","k"], function(d3,k){return(
(g, y) => g
    .call(d3.axisRight(y).ticks(12 * k))
    .call(g => g.select(".domain").attr("display", "none"))
)});
  main.variable(observer("grid")).define("grid", ["height","k","width"], function(height,k,width){return(
(g, x, y) => g
    .attr("stroke", "currentColor")
    .attr("stroke-opacity", 0.1)
    .call(g => g
      .selectAll(".x")
      .data(x.ticks(12))
      .join(
        enter => enter.append("line").attr("class", "x").attr("y2", height),
        update => update,
        exit => exit.remove()
      )
        .attr("x1", d => 0.5 + x(d))
        .attr("x2", d => 0.5 + x(d)))
    .call(g => g
      .selectAll(".y")
      .data(y.ticks(12 * k))
      .join(
        enter => enter.append("line").attr("class", "y").attr("x2", width),
        update => update,
        exit => exit.remove()
      )
        .attr("y1", d => 0.5 + y(d))
        .attr("y2", d => 0.5 + y(d)))
)});
  main.variable(observer("k")).define("k", ["height","width"], function(height,width){return(
height / width
)});
  main.variable(observer("height")).define("height", function(){return(
600
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5", "d3-array@2")
)});
  return main;
}
