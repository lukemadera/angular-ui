/**
//@todo - FINISH (form select opts)


Allows selecting a timezone

@dependencies:
- moment.js

//TOC

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
@param {String} ngModel Timezone (z) in format '[+/-]hh:mm'. I.e. '-07:00' or '+05:30'
@param {Object} opts

attrs
@param {String} [placeholder ='Choose a timezone'] Placeholder text for input


EXAMPLE usage:
partial / html:
<div ui-inputtimzeone ng-model='ngModel' opts=''></div>

controller / js:
$scope.ngModel ='';

//end: EXAMPLE usage
*/

//'use strict';

angular.module('ui.directives').directive('uiInputtimzeone', [function () {

	return {
		restrict: 'A',
		scope: {
			ngModel: '=',
			opts: '=?'
		},

		// template: "",
		compile: function(element, attrs) {
			if(!attrs.placeholder) {
				attrs.placeholder ='Choose a timezone';
			}
			
			var html ="<div>"+
				"<div ui-forminput type='select' ng-model='ngModel' select-opts='selectOpts' opts=''></div>"+
			"</div>";
			element.replaceWith(html);
			
			return function(scope, element, attrs) {
			};
		},
		
		controller: function($scope, $element, $attrs) {
			//@todo - switch to timezone names because those incorporate daylight savings times
			//UPDATE: this is incomplete - switched to using jstz 3rd party script: https://bitbucket.org/pellepim/jstimezonedetect/src/f9e3e30e1e1f53dd27cd0f73eb51a7e7caf7b378/jstz.js?at=default
				//can/should finish this input but make it match those timezone names
				
				/*
				'Pacific/Honolulu', '(UTC-10) Hawaii, United States'
				'America/Juneau', '(UTC-9) Alaska, United States'
				'America/Los_Angeles', '(UTC-8) California, United States'
				'America/Phoenix', '(UTC-7) Arizona, United States'
				'America/Denver', '(UTC-7) Colorado, United States'
				'America/Chicago', '(UTC-6) Texas, United States'
				'America/New_York', '(UTC-5) New York, United States'
				'America/La_Paz', '(UTC-4) La Paz, Bolivia'
				'America/Buenos_Aires', '(UTC-3) Buenos Aires, Argentina'
				'Europe/London', '(UTC+0) London, England'
				'Europe/Paris', '(UTC+1) Paris, France'
				'Africa/Cairo', '(UTC+2) Cairo, Egypt'
				'Europe/Moscow', '(UTC+3) Moscow, Russia'
				'Asia/Dubai', '(UTC+4) Dubai, Dubai'
				'Asia/Tashkent', '(UTC+5) Tashkent, Uzbekistan'
				'Asia/Kolkata', '(UTC+5.5) Mumbai, India'
				'Asia/Bangkok', '(UTC+7) Bangkok, Thailand'
				'Asia/Hong_Kong', '(UTC+8) Hong Kong, China'
				'Asia/Tokyo', '(UTC+9) Tokyo, Japan'
				'Australia/Sydney', '(UTC+10) Sydney, Australia'
				'Pacific/Samoa', '(UTC-11) Pago Pago, Samoa'
				'America/Noronha', '(UTC-2) Noronha, Bazil'
				'Atlantic/Azores', '(UTC-1) Azores, Portugal'
				'Asia/Omsk', '(UTC+6) Omsk, Russia'
				'Pacific/Ponape', '(UTC+11) Ponape, Micronesia'
				'Pacific/Fiji', '(UTC+12) Fiji'
				*/
				
			$scope.selectOpts =[
				{val: '-10:00', name:'(UTC-10) Hawaii, United States'},
				{val: '-09:00', name: '(UTC-9) Alaska, United States'},
				{val: '-08:00', name: '(UTC-8) California, United States'},
				{val: '-07:00', name: '(UTC-7) Arizona, United States'},
				{val: '-07:00', name: '(UTC-7) Colorado, United States'}
			];
		}
	};
}]);