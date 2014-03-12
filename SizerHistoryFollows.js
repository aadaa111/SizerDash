(function ($) {

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
    var lastUpdateTime = new Date('2000-1-1 0:0:00');
    var lastUploadTime = new Date('2000-1-1 0:0:00');

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

    function refreshFeedLine(feedID, datastreamID, selector, column1, column2) {
        // Get datastream data from Xively  
            xively.datastream.get(feedID, datastreamID, function (datastream) {
            drawLine(datastream, selector, column1, column2, feedID);
        });
    }

    function setWholeFeed(feedID) {
        xively.feed.get(feedID, function (feed) {

            doDisplaying(feed);
            setTimeout(function () {
                xively.feed.subscribe(feedID, function (event, feedUpdated) {
                    // Display the current value from the updated datastream  
                    doDisplaying(feedUpdated);
                });
            }, 5000);

        });
    }
    function doDisplaying(feed) {
        if (feed.datastreams) {
            feed.datastreams.forEach(function (datastream) {
                setState(datastream, "IsConnected", "#state");
                //setFeedLine(datastream, "GradeDistribution", "GradeDistribution", 'Time', 'FPM');
                setFeedLine(datastream, "MachineRpm", "MachineRpm", 'Time', 'RPM');
                setFeedLine(datastream, "MachineFpm", "MachineFpm", 'Time', 'FPM');
                setFeedLine(datastream, "MachineCupfill", "MachineCupfill", 'Time', 'RPM');
                setFeedLine(datastream, "MachineTph", "MachineTph", 'Time', 'FPM');
            });
        }
    }

    function setFeedLine(datastream, datastreamID, selector, column1, column2) {
        // Get datastream data from Xively  
            // Display the current value from the datastream  
        drawLine(datastream, datastreamID, selector, column1, column2, default_feed_id);
    }
    // Parse Xively ISO Date Format to Date Object
    Date.prototype.parseISO = function (iso) {
        var stamp = Date.parse(iso);
        if (!stamp) throw iso + ' Unknown date format';
        return new Date(stamp);
    };

    function drawLine(datastream, datastreamId, selector, column1, column2, feedId) {
        var elementId = document.getElementById(selector);
        if (elementId && datastream && datastream.id == datastreamId) {
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
                        var cloumns = [];
                        if (datastreamData.datapoints) {
                            datastreamData.datapoints.forEach(function (datapoint) {
                                points[rows] = [];
                                var date1 = new Date();
                                var dataString = datapoint.value;
                                points[rows][0] = date1.parseISO(datapoint.at);
                                var arrayStr1 = dataString.split(",");
                                if (arrayStr1.length > 1) {
                                    for (var j = 0; j < arrayStr1.length; j++) {
                                        arrayStr1[j] = arrayStr1[j].split(':');
                                        points[rows][1 + j] = parseFloat(arrayStr1[j][1]);
                                        if (cloumns.length != arrayStr1.length) {
                                            cloumns[j] = arrayStr1[j][0];
                                        }
                                    }
                                } else {
                                    points[rows][1] = parseFloat(dataString);
                                }
                                rows++;
                            });
                            //var arrayStr = "'A':30,'B':50,'C':200,'D':140,'E':45,'F':100";
                            var data = new google.visualization.DataTable();
                            data.addColumn('datetime', column1);
                            if (cloumns.length > 0) {
                                for (var i = 0; i < cloumns.length; i++) {
                                    data.addColumn('number', cloumns[i]);
                                }
                            } else {
                                 data.addColumn('number', column2);
                            }
                            //console.log(cloumns.length);
                            //console.log(points);
                            data.addRows(points);
                            // Set chart options
                            var options = {
                                //'width': 400,
                                height: 180,
                                hAxis: { format: timeFormat, viewWindowMode: 'maximized' },
                                //vAxis: { title: column2},
                            };
                            // Instantiate and draw our chart, passing in some options.
                            var chart = new google.visualization.LineChart(elementId);
                            chart.draw(data, options);
                            
                        }
                    });
                }            
        }

    }

    google.load("visualization", "1", { packages: ["corechart"] });
    google.setOnLoadCallback(loadCharts);

    function loadCharts() {
        checkOnline();
        setWholeFeed(default_feed_id);

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
