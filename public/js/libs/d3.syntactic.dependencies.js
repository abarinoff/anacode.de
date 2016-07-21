(function() {
  var wordHeight = 22, offset = 10, charWidth = 20, borderOffset = 3;

  d3.drawTree = function(svgElement, data) {
    var arrows, dependencies, e, edge, edges, item, svg, treeHeight, treeWidth, triangle, words, _i, _j, _k, _len, _len1, _len2;
    svg = d3.select(svgElement);
  
    edges = (function() {
      var results = [];
  
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (item.id) {
          results.push(item);
        }
      }
      return results;
    })();

/*
    for (_i = 0, _len = edges.length; _i < _len; _i++) {
      edge = edges[_i];
      for (_j = 0, _len1 = edges.length; _j < _len1; _j++) {
        edge = edges[_j];
        edge.level = 1 + maximum((function() {
          var _k, _len2, _results;
          _results = [];
          for (_k = 0, _len2 = edges.length; _k < _len2; _k++) {
            e = edges[_k];
            if (under(edge, e)) {
              _results.push(e.level);
            }
          }
              console.log("Levels: ", _results);
          return _results;
        })());
      }
    }
*/

    for(var i = 0; i < data.length; i++) {
      item = data[i];
      item.length = charWidth * item.word.length;
    }

    treeWidth = borderOffset;
    for(i = 0; i < data.length; i++) {
      treeWidth += data[i].length + offset;
    }
    treeWidth += borderOffset - offset;

    var levelsExist = false;
    for(i = 0; i < data.length; i++) {
      if(data[i].parent != null) levelsExist = true;
    }

    treeHeight = wordHeight/* + levelHeight(maximum((function() {
      var _k, _len2, _results;
      _results = [];
      for (_k = 0, _len2 = data.length; _k < _len2; _k++) {
        edge = data[_k];
        _results.push(edge.level);
      }
      return _results;
    })())) + 10*//* + 2 * wordHeight*/;

    if(levelsExist) {
      treeHeight += levelHeight(maximum((function() {
       var _k, _len2, _results;
       _results = [];
       for (_k = 0, _len2 = data.length; _k < _len2; _k++) {
       edge = data[_k];
       _results.push(edge.level);
       }
       return _results;
       })())) + 10;
    }

    var nextX = borderOffset;
    for (_k = 0, _len2 = data.length; _k < _len2; _k++) {
      item = data[_k];
      item.x = nextX;
      item.midX = nextX + + item.length / 2;
      nextX += item.length + offset;
      item.bottom = treeHeight - /*1.8 * */wordHeight + 5;
      item.top = item.bottom - levelHeight(item.level);
    }

    for (_k = 0, _len2 = data.length; _k < _len2; _k++) {
      item = data[_k];
      var parent = item.parent != undefined ? data[item.parent] : undefined;
      item.left = item.midX;
      item.right = parent ? parent.midX : 0;
      item.mid = (item.right + item.left) / 2;
      item.diff = (item.right - item.left) / 4;
      item.arrow = item.top + (item.bottom - item.top) * .25;
    }
    svg.selectAll('text, path').remove();
    svg.attr('xmlns', 'http://www.w3.org/2000/svg');
    svg.attr('width', treeWidth).attr('height', treeHeight + wordHeight / 2);
  
    words = svg.selectAll('.word').data(data).enter().append("g");

    words.filter(function(d) {
      return d.tooltip;
    })
    .attr("class","syndeps-tooltip")
    .attr("data-content", function(d) {
      return d.tooltip;
    });

    words.filter(function(d) {
      return d.background != undefined;
    }).append("rect")
        .attr('height', wordHeight)
        .attr('width', function(d) {
          return d.length + 6;
        })
        .attr('x', function(d) {
          return d.x - 3;
        })
        .attr('y', function(d) {
          return d.bottom + 5;
        })
        .style('fill', function(d) {return d.background;});

    words.append('text').text(function(d) {
      return d.word;
    }).attr('class', function(d) {
      return "word w" + d.id;
    }).attr('x', function(d) {
      return d.midX;
    }).attr('y', treeHeight + 5/*- wordHeight*/).on('mouseover', function(d) {
      svg.selectAll('.word, .dependency, .edge, .arrow').classed('active', false);
      return svg.selectAll(".w" + d.id).classed('active', true);
    }).on('mouseout', function(d) {
      return svg.selectAll('.word, .dependency, .edge, .arrow').classed('active', false);
    }).attr('text-anchor', 'middle');

    var usedEdgesStartPoints = [];
    edges = svg.selectAll('.edge').data(data).enter().append('path').filter(function(d) {
      return d.parent != null;
    }).attr('class', function(d) {
      return "edge w" + d.id + " w" + d.parent;
    }).attr('d', function(d) {
      while(usedEdgesStartPoints.indexOf(d.left) != -1) {
        d.left +=8;
      }
      usedEdgesStartPoints.push(d.left);
      while(usedEdgesStartPoints.indexOf(d.right) != -1) {
        d.right +=8;
      }
      usedEdgesStartPoints.push(d.right);

      return "M" + d.left + "," + d.bottom + " C" + (d.mid - d.diff) + "," + d.top + " " + (d.mid + d.diff) + "," + d.top + " " + d.right + "," + d.bottom;
    }).attr('fill', 'none').attr('stroke', 'black').attr('stroke-width', '1.5');
  
    dependencies = svg.selectAll('.dependency').data(data).enter().append('text').filter(function(d) {
      return d.parent != null;
    }).text(function(d) {
      return d.dependency;
    }).attr('class', function(d) {
      return "dependency w" + d.id + " w" + d.parent;
    }).attr('x', function(d) {
      return d.mid;
    }).attr('y', function(d) {
      return d.arrow - 7;
    }).attr('text-anchor', 'middle').attr('font-size', '90%');

    dependencies.filter(function(d) {
      return d.dependencyTooltip;
    })
    .classed("syndeps-dependency-tooltip", true)
    .attr("data-content", function(d) {
      return d.dependencyTooltip;
    });


    triangle = d3.svg.symbol().type('triangle-up').size(20);
  
    return arrows = svg.selectAll('.arrow').data(data).enter().append('path').filter(function(d) {
      return d.parent != null;
    }).attr('class', function(d) {
      return "arrow w" + d.id + " w" + d.parent;
    }).attr('d', triangle).attr('transform', function(d) {
      var rotationSign = (d.id < d.parent) ? "-" : "";
      return "translate(" + d.left + ", " + d.bottom + ") rotate(" + rotationSign + "30)";
    });
  };

  function levelHeight(level) {
    return 20 + Math.pow(level, 3) * 10;
  }

  function maximum(array) {
    return Math.max(0, Math.max.apply(null, array));
  }

  function under(edge1, edge2) {
    var ma, mi, _ref;
    _ref = edge1.id < edge1.parent ? [edge1.id, edge1.parent] : [edge1.parent, edge1.id], mi = _ref[0], ma = _ref[1];
    return edge1.id !== edge2.id && edge2.id >= mi && edge2.parent >= mi && edge2.id <= ma && edge2.parent <= ma;
  }
})();
