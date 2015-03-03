function draw(url){

var assayType2Color = {
    'A': Color({r: 255, g: 0, b: 0}),
    'F': Color({r: 0, g: 255, b: 0}),
    'B': Color({r: 0, g: 0, b: 255}),
    null: Color({r: 0, g: 0, b: 0})
}

var assayTestType2Color = {
    'In vivo': Color({r: 255, g: 0, b: 0}),
    'In vitro': Color({r: 0, g: 255, b: 0}),
    'Ex vivo': Color({r: 0, g: 0, b: 255}),
    null: Color({r: 0, g: 0, b: 0})
}

var margin = {top: 100, right: 0, bottom: 10, left: 100},
    width = 820,
    height = 820;

var color_value = 'solid';

var x = d3.scale.ordinal().rangeBands([0, width]),
    z = d3.scale.linear().domain([0, 4]).clamp(true);

var tip = d3.tip()
.attr('class', 'd3-tip')
.html(function(d) {
    if (typeof d == 'string' || d instanceof String)
        return d;
    return d.z;
});

$("#order").val('count');
$("#color").val('solid');

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", -margin.left + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var opts = {
  lines: 13, // The number of lines to draw
  length: 20, // The length of each line
  width: 10, // The line thickness
  radius: 30, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '42%' // Left position relative to parent
};
var spinner = new Spinner(opts).spin($('body')[0]);

svg.call(tip);

d3.json(url, function(assays) {
  spinner.stop();
  var matrix = [],
      nodes = assays.nodes,
      total = 0,
      n = nodes.length;

  $('#assay_num').text(n);

  // Compute index per node.
  nodes.forEach(function(node, i) {
    node.index = i;
    node.count = 0;
    matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
  });

  // Convert links to matrix; count character occurrences.
  assays.links.forEach(function(link) {
    matrix[link.source][link.target].z = link.value;
    matrix[link.target][link.source].z = link.value;
    nodes[link.source].count += link.value;
    nodes[link.target].count += link.value;
    total += link.value;
  });

  $('#data_num').text(total);

  // Precompute the orders.
  var orders = {
    group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; }),
    name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
    count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
    assay_type: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].assay_type, nodes[b].assay_type); }),
    assay_test_type: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].assay_test_type, nodes[b].assay_test_type); }),
  };

  var max = d3.max(assays.links, function (d) { return d.value });

  // The default sort order.
  x.domain(orders.count);

  svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height);

  var row = svg.selectAll(".row")
      .data(matrix)
    .enter().append("g")
      .attr("class", "row")
      .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      .each(row);

  row.append("line")
      .attr("x2", width);

  row.append("text")
      .attr("x", -6)
      .attr("y", x.rangeBand() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .text(function(d, i) { return nodes[i].name + '.' + nodes[i].assay_type; })
      .on("mouseover", function(row, j){
          tip.show(nodes[j].description);
          d3.selectAll(".row text").classed("linked", function(d, i) { return i == j; });
      })
      .on("mouseout", mouseout)
      .on("click", function(d, i){window.location = "https://www.ebi.ac.uk/chembl/assay/inspect/" + nodes[i].name});

  var column = svg.selectAll(".column")
      .data(matrix)
    .enter().append("g")
      .attr("class", "column")
      .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

  column.append("line")
      .attr("x1", -width);

  column.append("text")
      .attr("x", 6)
      .attr("y", x.rangeBand() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .text(function(d, i) { return nodes[i].name + '.' + nodes[i].assay_type; })
      .on("mouseover", function(col, j){
          tip.show(nodes[j].description);
          d3.selectAll(".column text").classed("linked", function(d, i) { return i == j; });
      })
      .on("mouseout", mouseout)
      .on("click", function(d, i){window.location = "https://www.ebi.ac.uk/chembl/assay/inspect/" + nodes[i].name});

    function draw_legend(data){
        console.log('drawing legend');
        var legend = d3.select("#legend_container").append("svg")
          .attr("class", "legend")
          .attr("width", 180)
          .attr("height", 180 * 2)
          .selectAll("g")
          .data($.map(data, function(val, key){return { label: key, color: val };}))
          .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", function(d) { return d.color.hexString(); });

        legend.append("text")
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .text(function(d) { return d.label; });
    }

  function row(row) {
    var cell = d3.select(this).selectAll(".cell")
        .data(row)
      .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function(d) { return x(d.x); })
        .attr("width", x.rangeBand())
        .attr("height", x.rangeBand())
        .style("fill-opacity", function(d) { return d.z/max; })
        .style("fill", colorise)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

      //cell.exit().remove();
  }

  function colorise(d)  {
            var color1 = null;
            var color2 = null;
            if (color_value=='solid')
                return '#0000FF';
            if (color_value=='assay_type'){
                var as1 = nodes[d.x].assay_type;
                var as2 = nodes[d.y].assay_type;
                color1 = assayType2Color[as1].clone();
                color2 = assayType2Color[as2].clone();
                }
            else{
                var as1 = nodes[d.x].assay_test_type;
                var as2 = nodes[d.y].assay_test_type;
                color1 = assayTestType2Color[as1].clone();
                color2 = assayTestType2Color[as2].clone();
            }
            if (color1.hexString() != color2.hexString()){
                color1.mix(color2);
            }
            return color1.hexString();
   }

  function mouseover(p) {
    tip.show(p);
    d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
    d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
  }

  function mouseout() {
    tip.hide();
    d3.selectAll("text").classed("active", false);
    d3.selectAll("text").classed("linked", false);
  }

 d3.select("#order").on("change", function() {
    order(this.value);
  });

 d3.select("#color").on("change", function() {
    color_value = this.value;
    color();
    $('#legend_container').empty();

    var palette = null;
    if (color_value=='solid')
        return;
    if (color_value=='assay_type')
        palette = assayType2Color;
    else
        palette = assayTestType2Color;
    $('#legend_container').append('<div class="legend">Legend:</div>');
    draw_legend(palette);

  });

 function color() {
    var t = svg.transition().duration(2500);

    t.selectAll(".cell")
        .style("fill", colorise);
 }

 function order(value) {
    x.domain(orders[value]);

    var t = svg.transition().duration(2500);

    t.selectAll(".row")
        .delay(function(d, i) { return x(i) * 4; })
        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      .selectAll(".cell")
        .delay(function(d) { return x(d.x) * 4; })
        .attr("x", function(d) { return x(d.x); });

    t.selectAll(".column")
        .delay(function(d, i) { return x(i) * 4; })
        .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
  }

var columns = ["source", "target", "value"];

    d3.select("body").append("div")
        .attr('id', 'tableContainer')
        .style('margin-top', '100px');

    var table = d3.select("#tableContainer").append("table")
          .attr('id', 'dataTable')
          .attr('class', 'display')
          .attr('cellspacing', 0)
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
            .text(function(column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(assays.links)
        .enter()
        .append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column, idx) {
                if (idx==2)
                    return {column: column, value: row[column]};
                return {column: column, value: nodes[row[column]].name}
            });
        })
        .enter()
        .append("td")
            .text(function(d) { return d.value; });

    $('#dataTable').dataTable();

});
}