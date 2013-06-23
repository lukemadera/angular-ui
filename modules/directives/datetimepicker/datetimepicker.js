/**
@todo
- modularize out forge / TriggerIO / native picker from pikaday datepicker? I.e. separate out all different types into their own directives and have this just include/reference the appropriate one?

Wrapper for pikaday datepicker (and timepicker)
ALSO works for TriggerIO forge native input
NOTE: native datetime inputs MUST have this format for values (otherwise they won't display and/or won't start on the correct date when the picker comes up) - 'YYYY-MM-DDTHH:mm:ssZ' i.e. '2012-05-18T00:01:02+03:00'
http://stackoverflow.com/questions/8177677/ios5-safari-display-value-for-datetime-type-in-forms

Pikaday:
https://github.com/owenmead/Pikaday (NOTE: this is the forked version that has the timepicker. It's not well documented but there's 3 additional options when loading the timepicker: showTime: false, showSeconds: false, use24hour: false
NOTE: I added in a "setTimeMoment" function to the forked file so it's now using pikaday-luke-edit.js with this new function

@dependencies:
- pikaday.js & pikaday.css
- moment.js

//TOC
1.5. scope.onSelectDate
1. onSelectDate
2. updateModel
3. handleValidOnchange

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
@param {String} ngModel Datetime string in format 'YYYY-MM-DD HH:mm:ssZ'. Time is optional.
@param {Function} validate Will be called everytime date changes PRIOR to setting the value of the date. Will pass the following parameters:
	@param {String} date
	@param {Object} params
	@param {Function} callback Expects a return of {Boolean} true if valid, false otherwise. If false, the value will be set to blank.
@param {Function} onchange Will be called everytime date changes. Will pass the following parameters:
	@param {String} date
	@param {Object} params
@param {Object} opts
	@param {Object} pikaday Opts to be used (will extend defaults) for pikaday

attrs
@param {String} [placeholder ='Choose a date/time'] Placeholder text for input


EXAMPLE usage:
partial / html:
<div ui-datetimepicker ng-model='ngModel' validate='validateDate' onchange='onchangeDate' opts='opts'></div>

controller / js:
$scope.ngModel ='';
$scope.opts ={
	pikaday: {
		//firstDay: 1,		//start on Monday
		showTime: true		//show timepicker as well
	}
};

$scope.validateDate =function(date, params, callback) {
	if(1) {
		callback(true);		//valid
	}
	else {
		callback(false);		//invalid
	}
};

$scope.onchangeDate =function(date, params) {
	console.log(date);
};


//end: EXAMPLE usage
*/

//'use strict';

angular.module('ui.directives').directive('uiDatetimepicker', [function () {

	/**
	NOTE: non '00' minute timezone offsets apparently do NOT work with moment.js dates... i.e. moment('2013-06-21 10:25:00 -07:30',  'YYYY-MM-DD HH:mm:ssZ') gives GMT-0700 NOT GMT-0730 as it should. So currently this function does NOT support tzToMinutes timezones that have minutes..
	
	moment.js apparently does not yet have a function / way to convert a date to a different timezone (other than 'local' and 'UTC'). As of 2013.06.21, see here:
	http://stackoverflow.com/questions/15347589/moment-js-format-date-in-a-specific-timezone (this says it can be done but it's not working for me - maybe it's only on non-stable branches of the code..)
	https://github.com/timrwood/moment/issues/482
	
	@param {Object} dateMoment moment.js date object
	@param {Number} [tzFromMinutes] Timezone minutes offset from UTC to be converted FROM. If not supplied, the timezone offset will be pulled from the dateMoment object. I.e. 420 for -07:00 (Pacific Time)
	@param {Number} [tzToMinutes] Timzeone minutes offset from UTC to be converted TO. If not supplied, the timezone of the current user's computer / browser will be used (using moment().zone() with no arguments).
	@param {Object} [params]
		@param {String} [format] moment.js format string for what to output
	@return {Object}
		@param {Object} date moment.js date object in the tzToMinutes timzeone
		@param {String} [dateFormatted] Date in formatted specified by params.format (if supplied)
	*/
	function convertTimezone(dateMoment, tzFromMinutes, tzToMinutes, params) {
		var ret ={date: false, dateFormatted:false};
		if(tzFromMinutes ===undefined || (!tzFromMinutes && tzFromMinutes !==0)) {
			tzFromMinutes =dateMoment.zone();
		}
		if(tzToMinutes ===undefined || (!tzToMinutes && tzToMinutes !==0)) {
			tzToMinutes =moment().zone();		//get user timezone
		}
		
		//use moment function to convert (doesn't work..)
		// dateMoment =dateMoment.zone(tzOffsetMinutes);
		// dateFormatted =dateMoment.format('YYYY-MM-DD HH:mm:ssZ');
		
		var tzDiffMinutes =tzToMinutes -tzFromMinutes;
		if(tzDiffMinutes >-1) {
			dateMoment =dateMoment.subtract('minutes', tzDiffMinutes);
		}
		else {
			dateMoment =dateMoment.add('minutes', tzDiffMinutes);
		}
		
		//manually add timezone offset
		var dateFormatted =dateMoment.format('YYYY-MM-DD HH:mm:ss');		//temporary string that will be used to form the final moment date object AFTER timezone conversion is done (since doesn't seem to be a way to change the timezone on an existing moment date object.. - if there was, we wouldn't need this entire function at all!)
		var hrOffset =Math.floor(tzToMinutes /60).toString();
		if(hrOffset.length ==1) {
			hrOffset ='0'+hrOffset;
		}
		var minutesOffset =(tzToMinutes %60).toString();
		if(minutesOffset.length ==1) {
			minutesOffset ='0'+minutesOffset;
		}
		var plusMinus ='+';
		if(tzToMinutes >=0) {
			plusMinus ='-';
		}
		var tzOffsetString =plusMinus+hrOffset+':'+minutesOffset;
		dateFormatted+=''+tzOffsetString;
		
		ret.date =moment(dateFormatted, 'YYYY-MM-DD HH:mm:ssZ');
		if(params.format !==undefined) {
			ret.dateFormatted =ret.date.format(params.format);
		}
		
		return ret;
	}
	
	return {
		restrict: 'A',
		//transclude: true,
		scope: {
			ngModel: '=',
			validate: '&',
			onchange: '&',
			opts: '='
		},

		// template: "<input type='datetime' />",
		compile: function(element, attrs) {
			var type ='pikaday';
			if(typeof(forge) !=='undefined' && forge && forge !==undefined) {
				type ='forge';		//TriggerIO
			}
			// console.log('datetimepicker type: '+type);
			
			if(!attrs.placeholder) {
				attrs.placeholder ='Choose a date/time';
			}
			
			var html ="<div>";
				if(type =='pikaday') {
					html +="<input class='ui-datetimepicker-input' type='datetime' placeholder='"+attrs.placeholder+"' />";		//NOTE: do NOT use ng-model here since we want the displayed value to potentially be DIFFERENT than the returned (ngModel) value
					// html+="<br />{{ngModel}}";
				}
				else if(type =='forge') {
					html +="<input class='ui-datetimepicker-input' type='datetime' placeholder='"+attrs.placeholder+"' />";		//NOTE: do NOT use ng-model here since we want the displayed value to potentially be DIFFERENT than the returned (ngModel) value (this especially breaks iOS native datetime input display)
					// html+="<br />{{ngModel}}";
				}
			html+="</div>";
			element.replaceWith(html);
			
			return function(scope, element, attrs) {
				//if was in an ng-repeat, they'll have have the same compile function so have to set the id here, NOT in the compile function (otherwise they'd all be the same..)
				if(attrs.id ===undefined) {
					attrs.id ="uiDatetimepicker"+Math.random().toString(36).substring(7);
				}
				//update the OLD name with the NEW name
				element.find('input').attr('id', attrs.id);
				
				var triggerSkipSelect =true;		//trigger to avoid validating, etc. on setting initial/default value
				
				if(type =='forge') {
					forge.ui.enhanceInput('#'+attrs.id);
					
					//set initial value
					if(scope.ngModel) {
						//native inputs need input value to be a javascript date object? So need to convert it.
						var dateObj =moment(scope.ngModel, 'YYYY-MM-DD HH:mm:ssZ');
						var inputFormat =dateObj.format('YYYY-MM-DDTHH:mm:ssZ');
						document.getElementById(attrs.id).value =inputFormat;
					}
					
					//doesn't fire
					// element.find('input').bind('change', function() {
						// console.log('bind change - ngModel: '+scope.ngModel);
						// onSelectDate(scope.ngModel);
					// });
					element.find('input').bind('blur', function() {
						// var value =scope.ngModel;		//is blank..
						var date =document.getElementById(attrs.id).value;
						// console.log('typeof(date): '+typeof(date)+' date: '+date);
						var dateMoment;
						var tzFromMinutes =false;
						if(typeof(date) =='object') {		//assume javascript date object
							dateMoment =moment(date);
						}
						else if(typeof(date) =='string') {		//assume Android, which apparently gives YYYY-MM-DDTHH:mmZ format..
							dateMoment =moment(date, 'YYYY-MM-DD HH:mm');
							if(date.indexOf('Z') >-1) {
								tzFromMinutes =0;
							}
						}
						
						//convert to local timezone (so it matches what the user actually selected)
						var dtInfo =convertTimezone(dateMoment, tzFromMinutes, false, {'format':'YYYY-MM-DD HH:mm:ssZ'});
						
						//update input value with non UTC value
						// var inputFormat =dtInfo.date;		//not working
						// var inputFormat =dtInfo.dateFormatted;		//kind of works for Android but not completely and not at all for iOS..
						var inputFormat =dtInfo.date.format('YYYY-MM-DDTHH:mm:ssZ');
						document.getElementById(attrs.id).value =inputFormat;
						
						onSelectDate(dtInfo.dateFormatted);
					});
				}
				else {		//pikaday
					var defaultPikadayOpts ={
						field: document.getElementById(attrs.id),
						onSelect: function() {
							var date =this.getMoment().format('YYYY-MM-DD HH:mm:ssZ');
							onSelectDate(date);
						},
						
						// format: 'H:mma, ddd MMM D, YYYY',
						//defaultDate and setDefaultDate don't seem to work (easily - format is finicky - so setting manually below after initialization)
						// defaultDate: new Date('2010-01-01 12:02:00'),		//doesn't work
						// defaultDate: new Date('2010-01-01'),		//works
						// defaultDate: new Date(scope.ngModel),
						// setDefaultDate: true,
						
						minDate: new Date('2000-01-01'),
						maxDate: new Date('2020-12-31'),
						yearRange: [2000, 2020]
						
						// showTime: true
					};
					if(scope.opts.pikaday ===undefined) {
						scope.opts.pikaday ={};
					}
					var pikadayOpts =angular.extend(defaultPikadayOpts, scope.opts.pikaday);
					
					var picker =new Pikaday(pikadayOpts);
					
					//set initial value
					if(scope.ngModel) {
						var dateOnly =scope.ngModel.slice(0,scope.ngModel.indexOf(' '));
						var timeOnly =scope.ngModel.slice((scope.ngModel.indexOf(' ')+1), scope.ngModel.length);
						// picker.setDate(dateOnly);		//this will mess up due to timezone offset
						picker.setMoment(moment(dateOnly, 'YYYY-MM-DD'));		//this works (isn't affected by timezone offset)
						// picker.setTime(scope.ngModel);		//doesn't work; nor does picker.setTime([hour], [minute], [second]);
						picker.setTimeMoment(moment(timeOnly, 'HH:mm:ss'));
						// document.getElementById(attrs.id).value ='2010-01-01 12:02:00';		//works but doesn't update the picker views
					}				
				}
				
				triggerSkipSelect =false;		//NOW can validate, etc. as usual
				
				/**
				@toc 1.5.
				@method scope.onSelectDate
				*/
				/*
				scope.onSelectDate =function() {
					console.log('scope.onSelectDate - ngModel: '+scope.ngModel);
					onSelectDate(scope.ngModel);
				};
				*/
				
				/**
				@toc 1.
				@method onSelectDate
				@param {String} date The date to set in 'YYYY-MM-DD HH:mm:ssZ' format
				*/
				function onSelectDate(date) {
					if(!triggerSkipSelect) {
						updateModel(date, {});		//update ngModel BEFORE validation so the validate function has the value ALREADY set so can compare to other existing values (passing back the new value by itself without ngModel doesn't allow setting it so the function may not know what instance this value corresponds to). We'll re-update the model again later if invalid.
						
						if(scope.validate !==undefined && scope.validate() !==undefined && typeof(scope.validate()) =='function') {		//this is an optional scope attr so don't assume it exists
							scope.validate()(date, {}, function(valid) {
								if(!valid) {		//may NOT want to blank out values actually (since datepicker closes on selection, this makes it impossible to change the time (to a valid one) after select a date). But as long as they pick the TIME first, they're okay (since time doesn't auto close the picker, only date does).
									date ='';
									//update pikaday plugin with blank date
									// picker.setDate(date);		//not working..
									document.getElementById(attrs.id).value ='';
									updateModel(date, {});
								}
								else {
									handleValidOnchange(date, {});
								}
							});
						}
						else {		//assume valid since not validate function defined
							handleValidOnchange(date, {});
						}
						if(!scope.$$phase) {
							scope.$apply();
						}
					}
				}
				
				/**
				@toc 2.
				@method updateModel
				*/
				function updateModel(date, params) {
					scope.ngModel =date;
					if(!scope.$$phase) {
						scope.$apply();
					}
				}
				
				/**
				@toc 3.
				@method handleValidOnchange
				*/
				function handleValidOnchange(date, params) {
					if(scope.onchange !==undefined && scope.onchange() !==undefined && typeof(scope.onchange()) =='function') {		//this is an optional scope attr so don't assume it exists
						scope.onchange()(date, {});
					}
				}
			};
		},
		
		controller: function($scope, $element, $attrs) {
		}
	};
}]);