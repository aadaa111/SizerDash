(function($) {

    /*
	EXAMPLE CONFIGURATION

		var defaultKey	= 'fje329iun52ngtuijo2f4jeun432A', // Unique master Xively API key to be used as a default
		defaultFeeds	= [61916,12425,94322], // Comma separated array of Xively Feed ID numbers
		applicationName	= 'My Company\'s Application', // Replaces Xively logo in the header
		dataDuration	= '90days', // Default duration of data to be displayed // ref: https://xively.com/dev/docs/api/data/read/historical_data/
		dataInterval	= 10800, // Default interval for data to be displayed (in seconds)
		dataColor		= '0A1922', // CSS HEX value of color to represent data (omit leading #)
		hideForm		= 0;
	*/

    var defaultKey = '5pZGok5BY4sIWrRiz77FgScAT743WVVfyUU9aPqK3V8s2ro6', // Unique master Xively API key to be used as a default
        defaultFeeds = [1884847396], // Comma separated array of Xively Feed ID numbers
        applicationName = 'SizerWebDemo', // Replaces Xively logo in the header
        dataDuration = '', // Default duration of data to be displayed // ref: https://xively.com/dev/docs/api/data/read/historical_data/
        dataInterval = 10, // Default interval for data to be displayed (in seconds)
        dataColor = '', // CSS HEX value of color to represent data (omit leading #)
        hideForm = 0; // To hide input form use value of 1, otherwise set to 0
    
    xively.setKey( defaultKey );  
  
    // Replace with your own values  
    var default_feed_id = defaultFeeds[0];          // Feed ID  
  
    function setFeed(feedID, datastreamID, selector) {
        // Get datastream data from Xively  
        xively.datastream.get (feedID, datastreamID, function ( datastream ) {  
            // WARNING: This code is only executed when we get a response back from Xively,   
            // it will likely execute after the rest your script  
            //  
            // NOTE: The variable "datastream" will contain all the Datastream information   
            // as an object. The structure of Datastream objects can be found at:   
            // https://xively.com/dev/docs/api/quick_reference/api_resource_attributes/#datastream  
  
            // Display the current value from the datastream  
            $(selector).html( datastream["current_value"] );  
  
            // Getting realtime!   
            // The function associated with the subscribe method will be executed   
            // every time there is an update to the datastream  
            setTimeout(function() {
                xively.datastream.subscribe(feedID, datastreamID, function(event, datastream_updated) {
                    // Display the current value from the updated datastream  
                    $(selector).html(datastream_updated["current_value"]);
                });
            }, 5000);
        });
    }
    
    function drawPie(dataString, selector, column1, column2, isBar) {
        //var arrayStr = "'A':30,'B':50,'C':200,'D':140,'E':45,'F':100";
        if (dataString) {
             var arrayStr1 = dataString.split(",");
            for (var i = 0; i < arrayStr1.length; i++) {
                arrayStr1[i] = arrayStr1[i].split(':');
                arrayStr1[i][1] = parseFloat(arrayStr1[i][1]);
            }
            var data = new google.visualization.DataTable();
            data.addColumn('string', column1);
            data.addColumn('number', column2);
            data.addRows(arrayStr1);
            // Set chart options
            // Instantiate and draw our chart, passing in some options.
            var height = 300;
            if (arrayStr1.length > 10) {
                height = 30 * arrayStr1.length;
            }
            if (isBar) {
                var options = {
                    //'width': 400,
                    'height': height,
                    'chartArea': { top: 20, height:height-80 },
                    vAxis: { title: column1},
                    hAxis: { title: column2},
                };
                var chart = new google.visualization.BarChart(document.getElementById(selector));
                chart.draw(data, options);
            } else {
               var options = {
                    'width': 400,
                    'height': 300,
                    'chartArea': { left: 30, top: 20, width:"90%", height:"90%" },
                    vAxis: { title: column1 },
                    hAxis: { title: column2 },
                };
                var chart = new google.visualization.PieChart(document.getElementById(selector));
                chart.draw(data, options);
            }
           
        }
    }

    function setFeedChart(feedID, datastreamID, selector, column1, column2, isBar) {
        // Get datastream data from Xively  
        xively.datastream.get(feedID, datastreamID, function (datastream) {
            // WARNING: This code is only executed when we get a response back from Xively,   
            // it will likely execute after the rest your script  
            //  
            // NOTE: The variable "datastream" will contain all the Datastream information   
            // as an object. The structure of Datastream objects can be found at:   
            // https://xively.com/dev/docs/api/quick_reference/api_resource_attributes/#datastream  

            // Display the current value from the datastream  
            drawPie(datastream["current_value"], selector, column1, column2, isBar);
            //drawChart();
            // Getting realtime!   
            // The function associated with the subscribe method will be executed   
            // every time there is an update to the datastream  
            setTimeout(function () {
                 xively.datastream.subscribe(feedID, datastreamID, function (event, datastream_updated) {
                    // Display the current value from the updated datastream  
                    drawPie(datastream_updated["current_value"], selector, column1, column2, isBar);
                    //drawChart();
                });
            }, 5000);
        });
    }
    google.load("visualization", "1", { packages: ["corechart"] });
    
    google.setOnLoadCallback(loadCharts);

    function loadCharts() {
        setFeed(default_feed_id, "VarietyName", "#VarietyName_text");
        setFeed(default_feed_id, "BatchName", "#BatchName_text");
        setFeed(default_feed_id, "GrowerName", "#GrowerName_text");
        setFeed(default_feed_id, "MachineRpm", "#MachineRpm_text");
        setFeed(default_feed_id, "MachineFpm", "#MachineFpm_text");
        setFeed(default_feed_id, "MachineTph", "#MachineTph_text");
        setFeed(default_feed_id, "MachineCupfill", "#MachineCupfill_text");
        setFeedChart(default_feed_id, "GradeDistribution", "GradeDistribution", 'Grade', 'FPM', false);
        setFeedChart(default_feed_id, "SizeDistribution", "SizeDistribution", 'Size', 'FPM', true);
        setFeedChart(default_feed_id, "LanesCupfill", "LanesCupfill", 'Lane', 'Cupfill', true);
    }
    //drawChart();
    function drawChart() {
        //var data = google.visualization.arrayToDataTable([
        //  ['Year', 'Sales', 'Expenses'],
        //  ['2004', 1000, 400],
        //  ['2005', 1170, 460],
        //  ['2006', 660, 1120],
        //  ['2007', 1030, 540]
        //]);
        //var options = {
        //    title: 'Company Performance'
        //};

        //var chart = new google.visualization.LineChart(document.getElementById('SizeDistribution'));
        //chart.draw(data, options);
        var selector = "#GradeDistribution";
        var arrayStr = "A:30,B:50,C:200,D:140,E:45,F:100";
        //var arrayStr = "'A':30,'B':50,'C':200,'D':140,'E':45,'F':100";
        var arrayStr1 = arrayStr.split(",");

        for (var i = 0; i < arrayStr1.length; i++) {
            arrayStr1[i] = arrayStr1[i].split(':');
            arrayStr1[i][1] = parseInt(arrayStr1[i][1]);
        }
        //var points = JSON.parse(array);
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Grade');
        data.addColumn('number', 'FPM');
        data.addRows(arrayStr1);
        //data.addRows(points);
  //      data.addRows([
  //['Mushrooms', 3],
  //['Onions', 1],
  //['Olives', 1],
  //['Zucchini', 1],
  //['Pepperoni', 2]
        //      ]);
        // Set chart options
        var options = {
            'title': 'How Much Pizza I Ate Last Night',
            'width': 400,
            'height': 300
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('GradeDistribution'));
        chart.draw(data, options);

    }

})(jQuery);
