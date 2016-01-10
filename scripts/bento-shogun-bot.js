// Description:
//   this bot informs Bento Shogun's daily menu.
//
// Configuration:
//
// Commands:
//   menu
//   start cronjob
//   stop cronjob
//
// Author:
//   jotaka-k

var client = require('cheerio-httpcli');
var CronJob = require('cron').CronJob;
var url = 'http://bento-shogun.jp/index.html';
var param = {};

module.exports = function(robot) {

  var sendMenuWithImg = function () {
    var envelope = {room: 'bento-hubot'};
    client.fetch(url, param, function(err, $, response) {
      if (err) {
        res.send('ERROR: ', err);
        return;
      }
      var titleDate = $('#menu-inner > h3').text().replace(/\n/g, '');
      var menuNames = [];
      var menuPicUrls = [];
      for (i = 0; i < 4; i++) {
        menuNames.push($('#menu-inner > ul > li').eq(i).children('dl').children('dt').text());
        menuPicUrls.push($('#menu-inner > ul > li').eq(i).children('a').children('img').attr('src'));
      }
      var menu = {titleDate: titleDate, menuNames: menuNames, menuPicUrls: menuPicUrls};

      robot.send(envelope, menu.titleDate);
      var counter = 0;
      var timer = setInterval(function() {
        robot.send(envelope, menu.menuNames[counter] + ' : ' + menu.menuPicUrls[counter]);
        counter++;
        if (counter > 3) {
          clearInterval(timer);
        };
      }, 2000);
    });
  };

  var sendMenuWithoutImg = function (res) {
    client.fetch(url, param, function(err, $, response) {
      if (err) {
        res.send('ERROR: ', err);
        return;
      }
      var titleDate = $('#menu-inner > h3').text().replace(/\n/g, '');
      var menuNames = [];
      for (i = 0; i < 4; i++) {
        menuNames.push($('#menu-inner > ul > li').eq(i).children('dl').children('dt').text());
      }
      var menu = {titleDate: titleDate, menuNames: menuNames};

      res.send(menu.titleDate);
      res.send(menu.menuNames.join('\n'));
    });
  };

  var cronJob = new CronJob('50 2 * * 1-5', sendMenuWithImg, null, true, null);

  robot.respond(/menu$/i, function(res) {
    sendMenuWithoutImg(res);
  });

  robot.respond(/start cronjob/i, function(res) {
    cronJob.start();
    res.send('starts cronjob');
  });

  robot.respond(/stop cronjob/i, function(res) {
    cronJob.stop();
    res.send('stops cronjob');
  });

};
