﻿(function ($) {

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
    var duration = '6hours';
    // Replace with your own values  
    var default_feed_id = defaultFeeds[0];          // Feed ID  

    function refreshFeedLine(feedID, datastreamID, selector, column1, column2) {
        // Get datastream data from Xively  
            xively.datastream.get(feedID, datastreamID, function (datastream) {
            drawLine(datastream, selector, column1, column2, feedID);
        });
    }

    function setFeedLine(feedID, datastreamID, selector, column1, column2) {
        // Get datastream data from Xively  
        xively.datastream.get(feedID, datastreamID, function (datastream) {
            // WARNING: This code is only executed when we get a response back from Xively,   
            // it will likely execute after the rest your script  
            //  
            // NOTE: The variable "datastream" will contain all the Datastream information   
            // as an object. The structure of Datastream objects can be found at:   
            // https://xively.com/dev/docs/api/quick_reference/api_resource_attributes/#datastream  

            // Display the current value from the datastream  
            drawLine(datastream, selector, column1, column2, feedID);
            //drawChart();
            // Getting realtime!   
            // The function associated with the subscribe method will be executed   
            // every time there is an update to the datastream  
            setTimeout(function () {
                xively.datastream.subscribe(feedID, datastreamID, function (event, datastream_updated) {
                    // Display the current value from the updated datastream  
                    drawLine(datastream_updated, selector, column1, column2, feedID);
                    //drawChart();
                });
            }, 5000);
        });
    }
    // Parse Xively ISO Date Format to Date Object
    Date.prototype.parseISO = function (iso) {
        var stamp = Date.parse(iso);
        if (!stamp) throw iso + ' Unknown date format';
        return new Date(stamp);
    }

    function drawLine(datastream, selector, column1, column2, feedId) {

        if (datastream) {
            var now = new Date();
            var then = new Date();
            var updated = new Date;
            updated = updated.parseISO(datastream.at);
            var diff = 21600000;
            var interval = 30;
            var timeFormat = "HH:mm";
            if (duration == '6hours') {
                diff = 21600000;
                interval = 30;
                timeFormat = "HH:mm";
            }
            if (duration == '1day') {
                diff = 86400000;
                interval = 60;
                timeFormat = "HH:mm";
            }
            if (duration == '1week') {
                diff = 604800000;
                interval = 900;
                timeFormat = "MM-dd HH:mm";
            }
            if (duration == '1month') {
                interval = 1800;
                diff = 2628000000;
                timeFormat = "yy-MM-dd HH:mm";
            }
            if (duration == '90days') {
                diff = 7884000000;
                interval = 10800;
                timeFormat = "yy-MM-dd HH:mm";
            }
            then.setTime(now.getTime() - diff);
            if (updated.getTime() > then.getTime()) {
                    xively.datastream.history(feedId, datastream.id, { duration: duration, interval: interval, limit: 1000 }, function(datastreamData) {
                        var points = [];
                        var rows = 0;
                        if (datastreamData.datapoints) {
                            datastreamData.datapoints.forEach(function (datapoint) {
                                points[rows] = [];
                                var date1 = new Date();
                                points[rows][0] = date1.parseISO(datapoint.at);
                                points[rows++][1] = parseFloat(datapoint.value);

                            });
                            //var arrayStr = "'A':30,'B':50,'C':200,'D':140,'E':45,'F':100";
                            var data = new google.visualization.DataTable();
                            data.addColumn('datetime', column1);
                            data.addColumn('number', column2);
                            data.addRows(points);
                            // Set chart options
                            var options = {
                                //'width': 400,
                                //'height': 300,
                                hAxis: { format: timeFormat, viewWindowMode: 'maximized' },
                                //vAxis: { title: column2},
                            };
                            // Instantiate and draw our chart, passing in some options.
                            var chart = new google.visualization.LineChart(document.getElementById(selector));
                            chart.draw(data, options);
                            
                        }
                    });
                }            
        }

    }

    google.load("visualization", "1", { packages: ["corechart"] });
    google.setOnLoadCallback(loadCharts);

    function loadCharts() {
        setFeedLine(default_feed_id, "MachineRpm", "MachineRpm", 'Time', 'RPM');
        setFeedLine(default_feed_id, "MachineFpm", "MachineFpm", 'Time', 'FPM');
        setFeedLine(default_feed_id, "MachineCupfill", "MachineCupfill", 'Time', 'RPM');
        setFeedLine(default_feed_id, "MachineTph", "MachineTph", 'Time', 'FPM');
        $('#radio-choice-1').click(function () {
            refreshChart('6hours');
        });
        $('#radio-choice-2').click(function () {
            refreshChart('1day');
        });
        $('#radio-choice-3').click(function () {
            refreshChart('1week');
        });
        $('#radio-choice-4').click(function () {
            refreshChart('1month');
        });
        $('#radio-choice-5').click(function () {
            refreshChart('90days');
        });
        $('#radio-choice-2').removeAttr('checked').checkboxradio("refresh");
        $('#radio-choice-3').removeAttr('checked').checkboxradio("refresh");
        $('#radio-choice-4').removeAttr('checked').checkboxradio("refresh");
        $('#radio-choice-5').removeAttr('checked').checkboxradio("refresh");
        $('#radio-choice-1').prop("checked", true).checkboxradio("refresh");
    }
    
    function refreshChart(selectedDuration) {
        duration = selectedDuration;
        setFeedLine(default_feed_id, "MachineRpm", "MachineRpm", 'Time', 'RPM');
        setFeedLine(default_feed_id, "MachineFpm", "MachineFpm", 'Time', 'FPM');
        setFeedLine(default_feed_id, "MachineCupfill", "MachineCupfill", 'Time', 'RPM');
        setFeedLine(default_feed_id, "MachineTph", "MachineTph", 'Time', 'FPM');
    }

})(jQuery);
