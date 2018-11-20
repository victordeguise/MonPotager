$(".plante").on("click", function (event) {
    var value = parseInt($(this).data("value"));
    add_node(value);
    restart();
    select_node(value);
    event.stopPropagation();
});
$(".reset-btn").on("click", function () {
    restart_with_list($(this).data("plantes").split("|"));
});

function restart_with_list(str_list) {
    var int_list = $.map(graph.nodes.filter(function (val) {
            return str_list.includes(val.name)
        }),
        function (node) {
            return node.value
        });
    remove_nodes();
    for (var i = 0; i < int_list.length; i++) {
        add_node(int_list[i])
    }
    restart();
}

$(".planteSelected").on("click", function (event) {
    var value = parseInt($(this).data("value"));
    select_node(value);
    event.stopPropagation();
});
$("#removeSelected").on("click", function (event) {
    var value = parseInt($(this).data("value"));
    remove_node(value);
    restart();
    event.stopPropagation();
});
$("#filter").on("click", function (event) {
    $(this).addClass("hidden");
    $(".plante").removeClass("filtered");
    event.stopPropagation();
});
$(".btn-filter").on("click", function (event) {
    var index = $(this).data("value");
    var direction = $(this).data("direction");
    var interaction = $(this).data("interaction");
    var cur_node = graph.nodes[index];
    var $plantes = $(".plante");
    $plantes.removeClass("filtered");
    var $filter = $("#filter");
    if (interaction === 'pos' || interaction === 'atr') {
        $filter.removeClass('btn-danger').addClass('btn-success')
    } else {
        $filter.addClass('btn-danger').removeClass('btn-success')
    }
    $("#filter-name").html(filter_name_dico[direction][interaction] + " " + cur_node.name.toLowerCase() + " ");
    $filter.removeClass("hidden");
    $plantes.each(function () {
        var $this = $(this);
        var thisIndex = parseInt($this.data("value"));
        var connected = graph[direction][index].filter(function (l) {
            return (l.target ? l.target : l.source) === thisIndex && l.value === interaction
        });
        if (connected.length === 0) {
            $this.addClass("filtered")
        }
    });
    event.stopPropagation();
});

function direction_interaction(direction, interaction, index) {
    var list_ids = $.map(graph[direction][index].filter(function (l) {
        return l.value === interaction
    }), function (val) {
        return val.source ? val.source : val.target
    });
    var graph_list_ids = list_ids.filter(function (val) {
        return index_nodes.includes(val)
    });
    if (graph_list_ids.length > 0) {
        $(".text", "#" + direction + "-" + interaction).text($.map(graph_list_ids, function (val) {
            return " " + graph.nodes[val].name
        }));
    } else {
        $(".text", "#" + direction + "-" + interaction).html("&#8709;")
    }

    var $button = $(".btn", "#" + direction + "-" + interaction);
    $button.removeClass("hidden");
    var other_interactions = list_ids.filter(function (x) {
        return !graph_list_ids.includes(x)
    }).length;
    if (other_interactions > 0) {
        $button.data('direction', direction);
        $button.data('interaction', interaction);
        $button.data('value', index);
        $button.text(String(other_interactions) + " dans l'inventaire");
    } else {
        $button.addClass("hidden")
    }
}

function select_node(index) {
    $(".planteSelected").removeClass("active").each(function () {
        var $this = $(this);
        if ($this.data("value") === index) {
            $this.addClass('active')
        }
    });
    is_selected = true;
    no_transparence();
    transparent(index);
    var cur_node = graph.nodes[index];
    var $removeSelected = $("#removeSelected");
    if (cat_animals.includes(cur_node.group)) {
        $removeSelected.addClass("hidden");
        $("#table-bug").removeClass("hidden");
        $("#table-plant").addClass("hidden")
    } else {
        $("#table-plant").removeClass("hidden");
        $("#table-bug").addClass("hidden");
        $removeSelected.removeClass("hidden");
        $removeSelected.data("value", index);
    }
    ["forward", "backward"].forEach(function (direction) {
        interactions.forEach(function (interaction) {
            direction_interaction(direction, interaction, index)
        });
    });

    var $plantes = $(".plante");
    $plantes.removeClass("filtered");
    $("#info-name").text(cur_node.name + " (" + groups[cur_node.group].toLowerCase() + ")");
    $("#info").removeClass("hidden");
}

var svg = d3.select("#graph"),
    width = +$(window).width(),
    height = +$(window).height();

var nodes = [], index_nodes = [], links = [];
var is_selected = false;
svg.append("defs").selectAll("marker")
    .data(interactions)
    .enter().append("marker")
    .attr("id", function (d) {
        return d;
    })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5");


var simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).distance(200).strength(0.2))
    .force("charge", d3.forceManyBody().strength(-600))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .on("tick", tick);

var g = svg.append("g"),
    link = g.append("g").attr("class", "links").selectAll(".link"),
    node = g.append("g").attr("class", "nodes").selectAll(".node");

svg.attr("viewBox", (-width / 2) + " " + (-height / 2) + " " + (width) + " " + (height))
    .attr("width", width)
    .attr("height", height)
    .style("pointer-events", "visible")
    .call(d3.zoom()
        .scaleExtent([1 / 2, 4])
        .on("zoom", zoomed));

function zoomed() {
    g.attr("transform", d3.event.transform);
}

function remove_nodes() {
    $(".planteSelected", "#jetsMyPotageomeContent").addClass("hidden");
    $(".plante", "#jetsPotageomeContent").removeClass("hidden");
    index_nodes = [];
    nodes = [];
    links = [];
}

function hide_animals() {
    ["pestDiscarded", "pest", "helpers"].forEach(function (div_id) {
        if ($(".animals", '#' + div_id).length === $(".hidden", '#' + div_id).length) {
            $('#' + div_id).hide();
        } else {
            $('#' + div_id).show();
        }
    });
}

function remove_node(cur_index) {
    var cur_node = graph.nodes[cur_index];

    if (cat_plantes.includes(cur_node.group)) {
        $("#planteSelected_" + String(cur_index), "#jetsMyPotageomeContent").addClass("hidden");
        $("#plante_" + String(cur_index), "#jetsPotageomeContent").removeClass("hidden");
    } else {
        $(".animal_" + String(cur_index), "#upper-left").addClass("hidden");
    }
    hide_animals();

    var i = index_nodes.indexOf(cur_index);
    index_nodes.splice(i, 1);
    nodes.splice(i, 1);

    links = links.filter(function (l) {
        return l.source.value !== cur_node.value && l.target.value !== cur_node.value;
    });

    nodes.forEach(function (tmp_node) {
        if (cat_animals.includes(tmp_node.group)) {
            if (links.filter(function (l) {
                var atr_rep = (l.target.value === tmp_node.value) && ["atr", "rep"].includes(l.value);
                var neg_pos = (l.source.value === tmp_node.value) && ["neg", "pos"].includes(l.value);
                return neg_pos || atr_rep;
            }).length === 0) {
                remove_node(tmp_node.value)
            }
        }
    });
}

function add_node(cur_index) {
    index_nodes.push(cur_index);
    var cur_node = graph.nodes[cur_index];
    nodes.push(cur_node);
    hide_animals();

    if (cat_plantes.includes(cur_node.group)) {
        $("#plante_" + String(cur_index), "#jetsPotageomeContent").addClass("hidden");
        $("#planteSelected_" + String(cur_index), "#jetsMyPotageomeContent").removeClass("hidden");
    } else {
        $("#helper_" + String(cur_index), "#helpers").removeClass("hidden");
    }

    for (var f = 0; f < graph.forward[cur_index].length; f++) {
        var f_link = graph.forward[cur_index][f];
        if (index_nodes.includes(f_link.target)) {
            links.push({"source": cur_node, "target": graph.nodes[f_link.target], "value": f_link.value});
        } else if (cat_animals.includes(f_link.group) && ["atr", "rep"].includes(f_link.value)) {
            add_node(f_link.target);
        }
    }
    for (var b = 0; b < graph.backward[cur_index].length; b++) {
        var b_link = graph.backward[cur_index][b];
        if (index_nodes.includes(b_link.source)) {
            links.push({"source": graph.nodes[b_link.source], "target": cur_node, "value": b_link.value});
        } else if (cat_animals.includes(b_link.group) && ["neg", "pos"].includes(b_link.value)) {
            add_node(b_link.source);
        }
    }
}

function restart() {

    // Apply the general update pattern to the nodes.
    node = node.data(nodes, function (d) {
        return d.value;
    });
    node.exit().remove();
    node = node.enter().append("g").attr("class", "node ").each(function () {
        d3.select(this).insert("circle")
            .attr("fill", function (d) {
                return color[d.group]
            })
            .attr("r", 10)
            .attr("value", function (d) {
                return d.value
            })
            .attr("data-toggle", "tooltip")
            .attr("title", function (d) {
                return groups[graph.nodes[parseInt(d.value)].group]
            });
        d3.select(this).insert("text")
            .attr("x", 11)
            .attr("y", -4)
            .text(function (d) {
                return d.name;
            })
    }).merge(node);

    // Apply the general update pattern to the links.
    link = link.data(links, function (d) {
        return d.source.value + "-" + d.target.value;
    });
    link.exit().remove();
    link = link.enter().append("path")
        .attr("class", function (d) {
            return "link " + d.value;
        })
        .attr("marker-end", function (d) {
            return "url(#" + d.value + ")";
        })
        .merge(link);


    $(".plante").each(function () {
        var $this = $(this);
        var value = $this.data("value");
        $(".plus", $this).text(String(
            graph.forward[value].filter(function (l) {
                return index_nodes.includes(l.target) && l.value === "pos"
            }).length +
            graph.backward[value].filter(function (l) {
                return index_nodes.includes(l.source) && l.value === "pos"
            }).length
        ));
        $(".minus", $this).text(String(
            graph.forward[value].filter(function (l) {
                return index_nodes.includes(l.target) && l.value === "neg"
            }).length +
            graph.backward[value].filter(function (l) {
                return index_nodes.includes(l.source) && l.value === "neg"
            }).length
        ))
    });
    $('[data-toggle="tooltip"]').tooltip({container: "body"});
    $("circle").on({
        mouseenter: function () {
            if (!is_selected) {
                no_transparence();
                transparent($(this).attr("value"))
            }
        },
        mouseleave: function () {
            if (!is_selected) {
                no_transparence();
                transparence_pest();
            }
        },
        click: function (event) {
            select_node($(this).attr("value"));
            event.stopPropagation();
        }
    });
    $(".planteSelected").removeClass('active');
    $("#filter").click();
    $("#info").addClass("hidden");
    is_selected = false;
    no_transparence();
    transparence_pest();

    // Update and restart the simulation.
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
    Cookies.set("nodes", $.map(nodes.filter(function (n) {
        return cat_plantes.includes(n.group);
    }), function (node) {
        return node.name
    }), {expires: 3650});
}

function transparent(index) {
    var cur_node = graph.nodes[index];
    link.filter(function (l) {
        return l.source.value !== cur_node.value && l.target.value !== cur_node.value;
    }).transition().style("opacity", "0.12");
    node.filter(function (d) {
        return d !== cur_node & graph.forward[index].filter(function (l) {
            return l.target === d.value
        }).length === 0 & graph.backward[index].filter(function (l) {
            return l.source === d.value
        }).length === 0
    }).transition().style("opacity", "0.12");
}

function no_transparence() {
    link.transition().style("opacity", "1");
    node.transition().style("opacity", "1");
}

function transparence_pest() {
    nodes.forEach(function (tmp_node) {
        if (tmp_node.group === 5) {
            var filtered_links = links.filter(function (l) {
                return (l.target.value === tmp_node.value && ["rep"].includes(l.value));
            });
            if (filtered_links.length > 0) {
                link.filter(function (l) {
                    return l.source.value === tmp_node.value || l.target.value === tmp_node.value;
                }).transition().style("opacity", "0.12");
                node.filter(function (d) {
                    return d === tmp_node;
                }).transition().style("opacity", "0.12");
                $("#repelled_pest_" + String(tmp_node.value), "#repelled_pests").removeClass("hidden");
            } else {
                $("#pest_" + String(tmp_node.value), "#pests").removeClass("hidden");
            }
        }
    });
}

$(document).on('click', function (evt) {
    if (is_selected) {
        $(".planteSelected").removeClass('active');
        $("#filter").click();
        $("#info").addClass("hidden");
        is_selected = false;
        no_transparence();
        transparence_pest();
    }
});

function tick() {
    node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
    });

    link.attr("d", function (d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    })
}

$(document).ready(function () {
    new Jets({
        searchTag: "#jetsPotageomeSearch",
        contentTag: "#jetsPotageomeContent"
    });

    var plante_list = Cookies.getJSON("nodes");
    if (plante_list) {
        restart_with_list(plante_list)
    } else {
        $('#reset').modal('show');
    }
    var $collapse = $('.collapse');
    $collapse.on('show.bs.collapse', function () {
        $(this).parent(".panel").find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
        $(this).parent(".panel").find(".text-left").html("Masquer la légende");
    });
    $collapse.on('hide.bs.collapse', function () {
        $(this).parent("div").parent("div").find(".glyphicon-chevron-up").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
        $(this).parent("div").parent("div").find(".text-left").html("Afficher la légende");
    });
});