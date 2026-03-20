/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 78.09405391003153, "KoPercent": 21.90594608996847};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.648248146010036, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6521797631862217, 500, 1500, "[Spike] GET / (Home)"], "isController": false}, {"data": [0.861809965803615, 500, 1500, "POST /reserve.php (Paris → Berlin)"], "isController": false}, {"data": [0.0, 500, 1500, "POST /purchase.php (Confirmar compra)"], "isController": false}, {"data": [0.8631858982169692, 500, 1500, "GET / (Home)"], "isController": false}, {"data": [0.664111689022721, 500, 1500, "[Spike] POST /reserve.php (Paris → Berlin)"], "isController": false}, {"data": [0.8607742251623178, 500, 1500, "GET /purchase.php?flight=1"], "isController": false}, {"data": [0.6558515160102012, 500, 1500, "[Spike] POST /purchase.php (Confirmar)"], "isController": false}, {"data": [0.6471734892787524, 500, 1500, "[Spike] GET /purchase.php?flight=1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 112595, 24665, 21.90594608996847, 749.7152893112553, 162, 10946, 433.0, 4641.100000000013, 7935.800000000003, 10109.0, 204.59802697688448, 1270.7840068326918, 52.88445199171669], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["[Spike] GET / (Home)", 3716, 0, 0.0, 995.0995694294938, 240, 5658, 513.0, 2512.800000000001, 3971.2499999999945, 5010.15, 57.83027530074544, 268.6520899473987, 10.165478080209159], "isController": false}, {"data": ["POST /reserve.php (Paris → Berlin)", 24564, 83, 0.3378928513271454, 721.3983064647443, 165, 10634, 336.0, 1228.9000000000015, 3279.4000000000087, 8831.920000000013, 44.730377651564126, 319.2700517139224, 10.483682262085342], "isController": false}, {"data": ["POST /purchase.php (Confirmar compra)", 24432, 24432, 100.0, 699.7576948264586, 162, 10620, 334.0, 1146.0, 2896.450000000008, 8772.900000000016, 44.51513809859578, 291.06944343380303, 19.127598401740375], "isController": false}, {"data": ["GET / (Home)", 24621, 69, 0.2802485682953576, 701.1954429145864, 164, 10683, 327.0, 1143.0, 2922.2000000000116, 8603.94000000001, 44.778643891473486, 207.4635222101783, 7.871245996548074], "isController": false}, {"data": ["[Spike] POST /reserve.php (Paris → Berlin)", 3653, 0, 0.0, 1002.2006569942521, 252, 5670, 488.0, 2771.9999999999995, 4302.0999999999985, 4989.22, 56.450117443441705, 404.24727120259763, 13.23049627580665], "isController": false}, {"data": ["GET /purchase.php?flight=1", 24489, 81, 0.33076074972436603, 717.5906733635487, 164, 10946, 335.0, 1174.0, 3150.9000000000015, 8811.920000000013, 44.643475661111374, 291.8181158120741, 8.763025984261118], "isController": false}, {"data": ["[Spike] POST /purchase.php (Confirmar)", 3529, 0, 0.0, 1022.1722867667901, 250, 5758, 497.0, 2789.0, 4321.5, 5154.5999999999985, 55.476081932938236, 363.7911540044881, 23.566499649246225], "isController": false}, {"data": ["[Spike] GET /purchase.php?flight=1", 3591, 0, 0.0, 1056.5299359509872, 251, 5499, 507.0, 2965.2000000000007, 4394.199999999997, 5094.08, 55.83716880208981, 366.1592030112965, 10.960225516816458], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Thank you for your purchase today!/", 24359, 98.75937563348874, 21.634175585061502], "isController": false}, {"data": ["429/Too Many Requests", 306, 1.2406243665112509, 0.27177050490696747], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 112595, 24665, "Test failed: text expected to contain /Thank you for your purchase today!/", 24359, "429/Too Many Requests", 306, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["POST /reserve.php (Paris → Berlin)", 24564, 83, "429/Too Many Requests", 83, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST /purchase.php (Confirmar compra)", 24432, 24432, "Test failed: text expected to contain /Thank you for your purchase today!/", 24359, "429/Too Many Requests", 73, "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (Home)", 24621, 69, "429/Too Many Requests", 69, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /purchase.php?flight=1", 24489, 81, "429/Too Many Requests", 81, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
