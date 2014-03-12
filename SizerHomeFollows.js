(function($) {
    var isMobile = jQuery.browser.mobile;
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

    xively.setKey(defaultKey);

    // Replace with your own values  
    var default_feed_id = defaultFeeds[0]; // Feed ID  
    var lastUpdateTime = new Date('2000-1-1 0:0:00');
    var lastUploadTime = new Date('2000-1-1 0:0:00');

    function setWholeFeed(feedID)
    {
        xively.feed.get(feedID, function(feed) {

            doDisplaying(feed);
            setTimeout(function () {
                xively.feed.subscribe(feedID, function (event, feedUpdated) {
                    // Display the current value from the updated datastream  
                    doDisplaying(feedUpdated);
                });
            }, 5000);

        });
    }

    function checkOnline() {
        var currentTime = new Date();
        var seconds = Math.round((currentTime - lastUpdateTime) / 1000);
        if (seconds > 30) {
            $("#state").html("Offline");
            $("#state").removeClass('online_style');
            $("#state").addClass('offline_style');
        }
        setTimeout(checkOnline, 20000);
    } 

    function doDisplaying(feed) {
        if (feed.datastreams) {
            feed.datastreams.forEach(function (datastream) {
                setState(datastream, "IsConnected", "#state");
                setText(datastream, "VarietyName", "#VarietyName_text");
                setText(datastream, "BatchName", "#BatchName_text");
                setText(datastream, "GrowerName", "#GrowerName_text");
                setText(datastream, "MachineRpm", "#MachineRpm_text");
                setText(datastream, "MachineFpm", "#MachineFpm_text");
                setText(datastream, "MachineTph", "#MachineTph_text");
                setText(datastream, "MachineCupfill", "#MachineCupfill_text");
                setText(datastream, "MachinePph", "#MachinePph_text");
                setChart(datastream, "GradeDistribution", "GradeDistribution", 'Grade', 'FPM', false);
                setChart(datastream, "SizeDistribution", "SizeDistribution", 'Size', 'FPM', true);
                setChart(datastream, "QualityDistribution", "QualityDistribution", 'Quality', 'FPM', false);
                setChart(datastream, "LanesCupfill", "LanesCupfill", 'Lane', 'Cupfill', true);
            });
        }
    }
  
    function setText(datastream, datastreamId, selector) {
        if (datastream.id == datastreamId) {
            $(selector).html( datastream["current_value"] );  
        }
    }

    function setState(datastream, datastreamId, selector) {
        if (datastream.id == datastreamId) {
            lastUploadTime = new Date(Date.parse(datastream.at));
            lastUpdateTime = new Date();
            //var seconds = Math.round((currentTime - lastUpdateTime) / 1000);
            if (datastream["current_value"] == "true") {
                $(selector).html("Online");
                $(selector).removeClass('offline_style');
                $(selector).addClass('online_style');
            } else {
                $(selector).html("Offline");
                $(selector).removeClass('online_style');
                $(selector).addClass('offline_style');
            }
            $("#lastUploadTime").html("Last modify time: " + datastream.at);
        }
    }

    function drawPie(dataString, selector, column1, column2, isBar) {
        //var arrayStr = "'A':30,'B':50,'C':200,'D':140,'E':45,'F':100";

        var elementId = document.getElementById(selector);
        if (elementId && dataString) {
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
            if (!isMobile) {
                console.log(screen.height);
                height = screen.height /2 - 140;
            }
            else if (arrayStr1.length > 10 && isBar) {
                height = 40 * arrayStr1.length;
            }
            if (isBar) {
                var options = {
                    //'width': 400,
                    'height': height,
                    'chartArea': { left: 100, top: 20, width:"80%", height: height - 80 },
                    vAxis: { title: column1},
                    hAxis: { title: column2},
                };
                var chart = new google.visualization.BarChart(document.getElementById(selector));
                chart.draw(data, options);
            } else {
                var options = {
                    'height': height,
                    'chartArea': { left: 50, top: 20, height:"85%" },
                    vAxis: { title: column1 },
                    hAxis: { title: column2 },
                };
                var chart = new google.visualization.PieChart(elementId);
                chart.draw(data, options);
            }
           
        }
    }

    function setChart(datastream, datastreamId, selector, column1, column2, isBar) {
        // Get datastream data from Xively  
        if (datastream.id == datastreamId) {
            drawPie(datastream["current_value"], selector, column1, column2, isBar);
        }
    }
    google.load("visualization", "1", { packages: ["corechart"] });
    
    google.setOnLoadCallback(loadCharts);

    function loadCharts() {
        checkOnline();
        setWholeFeed(default_feed_id);
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
