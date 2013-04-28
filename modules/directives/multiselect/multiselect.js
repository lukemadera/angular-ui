/**
@todo2:
- load more / calling function to load more opts & then update them (i.e. when scroll to bottom or click "more")
	- use timeout for searching more & auto search more if result isn't found in default/javascript/local opts
- $watch to update opts

USAGE functions:
//to update options after it's been written / initialized:
$scope.$broadcast('uiMultiselectUpdateOpts', {'id':'select1', 'opts':optsNew});


Table of Contents
controller
//0. init vars, etc.
//15. $scope.focusInput
//14. selectOpts
//11. filterOpts
//13. $scope.keydownInput
//6. $scope.clickInput
//7. $scope.selectOpt
//8. $scope.removeOpt
//9. $scope.$on('uiMultiselectUpdateOpts',..
//10. formOpts
//12. $scope.createNewOpt
	//12.5. createNewCheck
//0.5. init part 2 (after functions are declared) - select default options, etc.
//0.75. $scope.$watch('ngModel',.. - to update selected values on change

uiMultiselectData service
//1. init
//2. toggleDropdown
//3. getFocusCoords
//4. blurInput
//5. mouseInDiv


attrs
	REQUIRED
	selectOpts =array []{} of options
		val =value of this option
		name =text/html to display for this option
	ngModel
	OPTIONAL
	createNew =int 1 or 0; 1 to allow creating a new option from what the user typed IF it doesn't already exist
	placeholder =string of text/prompt to show in input box
	minLengthCreate (default 1) =int of how many characters are required to be a valid new option
	onChangeEvt =string of event to broadcast on change (or remove) options


EXAMPLE usage:
partial / html:
	<div ui-multiselect id='select1' select-opts='selectOpts' ng-model='selectVals'></div>

controller / js:
	$scope.selectVals =[];
	$scope.selectOpts =[
		{'val':1, 'name':'one'},
		{'val':2, 'name':'two'},
		{'val':3, 'name':'three'},
		{'val':4, 'name':'four'},
		{'val':5, 'name':'five'},
	];
	
	//to update options - NOTE: this must be done AFTER $scope is loaded - the below will NOT work until wrapped inside a callback or timeout so the $scope has time to load
	var optsNew =[
		{'val':1, 'name':'yes'},
		{'val':2, 'name':'no'},
		{'val':3, 'name':'maybe'},
	];
	$scope.$broadcast('uiMultiselectUpdateOpts', {'id':'select1', 'opts':optsNew});

//end: EXAMPLE usage
*/

angular.module('ui.directives').directive('uiMultiselect', ['ui.config', 'uiMultiselectData', 'uiLibArray', '$timeout', '$filter', function (uiConfig, uiMultiselectData, libArray, $timeout, $filter) {

	return {
		priority: 100,		//must be below 500 to work with lFormInput directive
		scope: {
			selectOpts:'=',
			ngModel:'=',
			createNew:'='
		},

		compile: function(element, attrs) {
			var defaultsAttrs ={'placeholder':'Type to search', 'minLengthCreate':1};
			//attrs =angular.extend(defaultsAttrs, attrs);
			//attrs =libArray.extend(defaultsAttrs, attrs, {});
			//attrs =$.extend({}, defaultsAttrs, attrs);
			for(var xx in defaultsAttrs) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaultsAttrs[xx];
				}
			}
					
			if(attrs.id ===undefined) {
				attrs.id ="uiMultiselect"+Math.random().toString(36).substring(7);
			}
			var formId =attrs.formId =attrs.id;
			var formId1 =attrs.id;
			
			var id1 =formId1;
			attrs.formId1 =formId1;
			uiMultiselectData.data[formId1] ={
			'ids':{
				'displayBox':id1+"DisplayBox",
				'input':id1+"Input",
				'dropdown':id1+"Dropdown",
				'selectedOpts':id1+"SelectedOpts",
				'selectedOpt':id1+"SelectedOpt",
				'remove':id1+"Remove",
				'opt':id1+"Opt"
				},
			'opts':{},		//NOTE: options are passed in as [] but converted to object / associative array here
			'blurCoords':{'left':-1, 'right':-1, 'top':-1, 'bottom':-1},
			'skipBlur':false,		//trigger to avoid immediate close for things like clicking the input
			//'ngModel':attrs.ngModel,
			//'scope':scope,
			//'ngModel':ngModel,
			'lastSearchVal':'',		//default to blank
			'attrs':attrs,
			'maxWrite':25		//int of how many to stop writing after (for performance, rest are still searchable)
			};
			
			var html ="<div id='"+formId1+"' class='ui-multiselect'>";
				html+="<div id='"+uiMultiselectData.data[formId1].ids.displayBox+"' class='ui-multiselect-display-box' ng-click='focusInput({})'>"+
					"<div id='"+uiMultiselectData.data[formId1].ids.selectedOpts+"' class='ui-multiselect-selected-opts'>"+
						"<div ng-repeat='opt in selectedOpts' class='ui-multiselect-selected-opt'><div class='ui-multiselect-selected-opt-remove' ng-click='removeOpt(opt, {})'>X</div> {{opt.name}}</div>"+
					"</div>"+
					"<div class='ui-multiselect-input-div'>"+
						"<input id='"+uiMultiselectData.data[formId1].ids.input+"' type='text' ng-change='filterOpts({})' placeholder='"+attrs.placeholder+"' class='ui-multiselect-input' ng-model='modelInput' ng-click='clickInput({})' />"+
					"</div>"+
				"</div>"+
				"<div class='ui-multiselect-dropdown-cont'>"+
					"<div id='"+uiMultiselectData.data[formId1].ids.dropdown+"' class='ui-multiselect-dropdown'>";
						//html+="<div class='ui-multiselect-dropdown-opt' ng-repeat='opt in opts | filter:{name:modelInput, selected:\"0\"}' ng-click='selectOpt(opt, {})'>{{opt.name}}</div>";
						html+="<div class='ui-multiselect-dropdown-opt' ng-repeat='opt in filteredOpts' ng-click='selectOpt(opt, {})'>{{opt.name}}</div>";
						html+="<div class='ui-multiselect-dropdown-opt' ng-show='createNew && createNewAllowed && filteredOpts.length <1' ng-click='createNewOpt({})'>[Create New]</div>"+
						"<div class='ui-multiselect-dropdown-opt' ng-show='loadingOpt'>Loading..</div>";
					//opts will be built and stuff by writeOpts function later
					html+="</div>";
				html+="</div>";
			html+="</div>";
			element.replaceWith(html);
			
			if(!uiMultiselectData.inited) {
				uiMultiselectData.init({});
			}
			
			/*
			return function(scope, element, attrs, ngModel) {
				$compile($(element))(scope);		//compile
			}
			*/
		},
		
		controller: function($scope, $element, $attrs, $transclude) {
			//0. init vars, etc.
			if($scope.ngModel ===undefined) {
				$scope.ngModel =[];
			}
			else if(typeof($scope.ngModel) =='string') {		//convert to array
				$scope.ngModel =[$scope.ngModel];
			}
			$scope.modelInput ='';
			$scope.loadingOpt =false;
			$scope.createNewAllowed =true;		//will be true if create new is currently allowed (i.e. if no duplicate options that already exist with the current input value)
			var formId1 =$attrs.formId1;
			
			var keycodes ={
				'enter':13
			};
			
			$scope.selectedOpts =[];		//start with none selected
			
			//form array {} of all options by category; start with just one - the default select opts. This is to allow multiple different types of opts to be used/loaded (i.e. when loading more results from AJAX or when user creates a new option) so can differentiate them and append to/update or show only certain categories of options.
			var optsList ={
				'default':libArray.copyArray($scope.selectOpts, {})
			};
			//copy default (passed in) opts to final / combined (searchable) opts
			formOpts({});
			
			//get focus coords for toggling dropdown on blur and then hide dropdown
			uiMultiselectData.getFocusCoords($attrs.formId1, {});		//BEFORE dropdown is hidden, get coords so can handle blur
			uiMultiselectData.toggleDropdown($attrs.formId1, {'hide':true});		//start dropdown hidden
			
			$("#"+uiMultiselectData.data[formId1].ids.input).keyup(function(evt) {
				$scope.keydownInput(evt, {});
			});
			
			//15.
			$scope.focusInput =function(params) {
				$("#"+uiMultiselectData.data[formId1].ids.input).focus();
				$scope.clickInput({});
			};
			
			//14.
			/*
			@param optsArray =array [] of option values to select (will go through al the options and match the values to them then call the "selectOpt" function for each one that's matched)
			@param params
			*/
			function selectOpts(optsArray, params) {
				for(var ii=0; ii<optsArray.length; ii++) {
					for(var xx in optsList) {		//go through each type and search for match (break once get the first one)
						var index1 =libArray.findArrayIndex(optsList[xx], 'val', optsArray[ii], {});
						if(index1 >-1) {		//found it
							$scope.selectOpt(optsList[xx][index1], {});
							break;		//don't bother searching the other option types
						}
					}
				}
			}
			
			//13.
			$scope.keydownInput =function(evt, params) {
				if(evt.keyCode ==keycodes.enter) {
					//alert("enter");
					if($scope.filteredOpts.length >0) {		//select first one
						$scope.selectOpt($scope.filteredOpts[0], {});
					}
					else if($scope.createNew) {		//create new
						$scope.createNewOpt({});
					}
				}
			};
			
			//11.
			$scope.filterOpts =function(params) {
				$scope.filteredOpts =$filter('filter')($scope.opts, {name:$scope.modelInput, selected:"0"});
				if($scope.filteredOpts.length <1) {
					if($scope.createNew && createNewCheck({}) ) {
						$scope.createNewAllowed =true;
					}
					else {
						$scope.createNewAllowed =false;
					}
				}
				//var dummy =1;
			};
			
			//6.
			$scope.clickInput =function(params) {
				$scope.filterOpts({});
				uiMultiselectData.data[$attrs.formId1].skipBlur =true;		//avoid immediate closing from document click handler
				uiMultiselectData.toggleDropdown($attrs.formId1, {'show':true});
				//fail safe to clear skip blur trigger (sometimes it doesn't get immediately called..)
				$timeout(function() {
					uiMultiselectData.data[$attrs.formId1].skipBlur =false;		//reset
				}, 150);
			};
			
			//7.
			$scope.selectOpt =function(opt, params) {
				var valChanged =false;		//track if something actually changed (other than just display)
				//alert(opt.name);
				uiMultiselectData.data[$attrs.formId1].skipBlur =true;		//avoid immediate closing from document click handler
				$timeout(function() {
					uiMultiselectData.data[$attrs.formId1].skipBlur =false;		//reset
				}, 150);
				var index1;
				index1 =libArray.findArrayIndex($scope.ngModel, '', opt.val, {'oneD':true});
				if(index1 <0) {
					$scope.ngModel.push(opt.val);
					valChanged =true;
				}
				//check opt display separately (i.e. if initing values)
				//var index1 =libArray.findArrayIndex($scope.selectedOpts, '', opt.val, {'oneD':true});
				index1 =libArray.findArrayIndex($scope.selectedOpts, 'val', opt.val, {});
				if(index1 <0) {
					opt.selected ="1";
					$scope.selectedOpts.push(opt);
				}
				//reset search key & refocus on input
				$scope.modelInput ='';		//reset
				$("#"+uiMultiselectData.data[formId1].ids.input).focus();
				//uiMultiselectData.toggleDropdown($attrs.formId1, {'show':true});
				$scope.filterOpts({});
				if(valChanged) {
					if($attrs.onChangeEvt !==undefined) {
						$scope.$emit($attrs.onChangeEvt, {'val':$scope.ngModel});
					}
				}
			};
			
			//8.
			$scope.removeOpt =function(opt, params) {
				var valChanged =false;
				var index1;
				index1 =libArray.findArrayIndex($scope.ngModel, '', opt.val, {'oneD':true});
				if(index1 >-1) {
					valChanged =true;
					$scope.ngModel.remove(index1);
					/*
					if(params.attrs.formChangeEvt !=undefined) {
						var ppTemp ={'val':curVal, 'formId':params.attrs.formId, 'formChangeEvt':params.attrs.formChangeEvt};
						if(params.attrs.formChangeId) {
							ppTemp.formChangeId =params.attrs.formChangeId;
						}
						thisObj.onChange(instId, ppTemp);
					}
					*/
					opt.selected ="0";
					//remove from selected opts array
					index1 =libArray.findArrayIndex($scope.selectedOpts, 'val', opt.val, {});
					if(index1 >-1) {
						$scope.selectedOpts.remove(index1);
					}
					$scope.filterOpts({});
				}
				
				if(valChanged) {
					if($attrs.onChangeEvt !==undefined) {
						$scope.$emit($attrs.onChangeEvt, {'val':$scope.ngModel});
					}
				}
			};
			
			//9.
			/*
			@param params
				id (required) =instance id for this directive (to indentify which select to update opts for); must match the "formId1" attribute declared on this directive
				opts (required) =array []{} of opts to update/add
				type (defaults to 'default') =string of which optsList to add/update these to
				replace (default true) =boolean true if these new opts will overwrite existing ones of this type (if false, they'll just be appended to the existing ones - NOTE: new opts should not conflict with existing ones; don't pass in any duplicates as these are NOT checked for here)
			*/
			$scope.$on('uiMultiselectUpdateOpts', function(evt, params) {
				if(params.id ==formId1) {		//$scope.$on will be called on EVERY instance BUT only want to update ONE of them
					var defaults ={'type':'default', 'replace':true};
					params =angular.extend(defaults, params);
					if(optsList[params.type] ===undefined || params.replace ===true) {
						optsList[params.type] =params.opts;
					}
					else {
						optsList[params.type] =optsList[params.type].concat(params.opts);
					}
					formOpts({});		//re-form opts with the new ones
					selectOpts($scope.ngModel, {});
				}
			});
			
			//10.
			/*
			concats all types in optsList into a final set of options to be selected from / displayed
			@param params
				//unselectAll =boolean true to unselect all opts as well
				keys (optional) =array [] of which optsList keys to copy over; otherwise all will be copied over
			*/
			function formOpts(params) {
				var keys, ii;
				if(params.keys !==undefined) {
					keys =params.keys;
				}
				else {		//copy them all
					keys =[];
					var counter =0;
					for(var xx in optsList) {
						keys[counter] =xx;
						counter++;
					}
				}
				$scope.opts =[];		//reset first
				for(ii =0; ii<keys.length; ii++) {
					$scope.opts =$scope.opts.concat(optsList[keys[ii]]);
				}
				
				//add some keys to each opt
				for(ii =0; ii<$scope.opts.length; ii++) {
					var index1 =libArray.findArrayIndex($scope.selectedOpts, 'val', $scope.opts[ii].val, {});
					if(index1 <0) {		//if not selected
						$scope.opts[ii].selected ="0";		//start visible
					}
				}
			}
			
			//12.
			$scope.createNewOpt =function(params) {
				if(createNewCheck({})) {
					if(optsList.created ===undefined) {
						optsList.created =[];
					}
					//var curIndex =optsList.created.length;
					var newOpt ={'val':$scope.modelInput, 'name':$scope.modelInput, 'selected':'0'};
					optsList.created[optsList.created.length] =newOpt;
					formOpts({});		//re-form opts with the new ones
					//select this opt
					$scope.selectOpt(newOpt, {});
				}
			};
			
			//12.5.
			function createNewCheck(params) {
				var valid =false;
				var val =$scope.modelInput;
				if(val.length >=$attrs.minLengthCreate) {
					//make sure this value doesn't already exist
					var index1 =libArray.findArrayIndex($scope.opts, 'val', val, {});
					if(index1 <0) {		//if doesn't already exist
						valid =true;
					}
				}
				return valid;
			}
			
			//0.5.
			//select default opts
			selectOpts($scope.ngModel, {});
			
			//0.75.
			$scope.$watch('ngModel', function(newVal, oldVal) {
				//if(newVal !=oldVal) {
				//if(1) {		//comparing equality on arrays doesn't work well..
				if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
					selectOpts($scope.ngModel, {});
				}
			});
		}
	};
}])
.factory('uiMultiselectData', ['uiLibArray', '$rootScope', function(libArray, $rootScope) {
var inst ={
	data: {}, //data object for each select is created in compile function above - one per instance id
	
	timeout:{
		'searchOpts': {
			'trig':false,
			'delay':250
		}
	},
	
	inited:false,
	
	//1.
	init: function(params) {
		var thisObj =this;
		$(document).click(function(evt) {
			for(var xx in thisObj.data) {
				var instId =xx;
				if(thisObj.data[instId].blurCoords.top >-1) {		//if it's been initialized
					if(!thisObj.mouseInDiv(evt, '', {'coords':thisObj.data[instId].blurCoords})) {
						//alert("document click out: "+ee.pageX+" "+ee.pageY);
						thisObj.blurInput(instId, {});
					}
				}
			}
		});
		
		this.inited =true;
	},
	
	//2.
	/*
	@param params
		hide =boolean true to hide it
		show =boolean true to show it
	*/
	toggleDropdown: function(instId, params) {
		var id1 =this.data[instId].ids.dropdown;
		if(params.hide ===true) {
			$("#"+id1).addClass('hidden');
		}
		else {
			$("#"+id1).removeClass('hidden');
		}
	},
	
	//3.
	getFocusCoords: function(instId, params) {
		var ids ={'displayBox':this.data[instId].ids.displayBox, 'dropdown':this.data[instId].ids.dropdown};
		var eles ={};
		eles.displayBox =$("#"+this.data[instId].ids.displayBox);
		eles.dropdown =$("#"+this.data[instId].ids.dropdown);
		
		this.toggleDropdown(instId, {'show':true});		//required otherwise sometimes it won't be correct..

		var top1 =eles.displayBox.offset().top;
		var left1 =eles.displayBox.offset().left;
		//var bottom1 =0;
		var bottom1 =eles.dropdown.offset().top +eles.dropdown.outerHeight();
		var right1 =left1 +eles.displayBox.outerWidth();
		
		this.toggleDropdown(instId, {'hide':true});		//revert
		
		this.data[instId].blurCoords ={'left':left1, 'right':right1, 'top':top1, 'bottom':bottom1};
		//console.log("blur coords: left: "+this.data[instId].blurCoords.left+" right: "+this.data[instId].blurCoords.right+" top: "+this.data[instId].blurCoords.top+" bottom: "+this.data[instId].blurCoords.bottom);
	},
	
	//4.
	blurInput: function(instId, params) {
		if(!this.data[instId].skipBlur) {
			//console.debug('blurring '+instId);
			this.toggleDropdown(instId, {'hide':true});
		}
		this.data[instId].skipBlur =false;		//reset
	},
	
	//5.
	/*
	//Figure out if the mouse is within the area of the input and/or dropdown at the time of this event (usually a click/touch)
	@param ee =dom event
	@param instId
	@param params
		coords =1D array of 'left', 'top', 'right', 'bottom' (all integers of pixel positions)
	@return boolean true if mouse is in div/coords
	*/
	mouseInDiv: function(ee, instId, params) {
		var coords;
		if(params.coords)
			coords =params.coords;
		else
		{
			var left1 =$("#"+instId).offset().left;
			var top1 =$("#"+instId).offset().top;
			var bottom1 =top1+$("#"+instId).height();
			var right1 =left1+$("#"+instId).width();
			coords ={'left':left1, 'top':top1, 'bottom':bottom1, 'right':right1};
		}
		//if(1)		//doesn't work - ee doesn't have a pageX & pageY from blur
		if(ee.pageX >=coords.left && ee.pageX <=coords.right && ee.pageY >=coords.top && ee.pageY <=coords.bottom)
		{
			return true;
		}
		else
		{
			//alert(inputId+" COORDS: "+coords['left']+" "+ee.pageX+" "+coords['right']+" "+coords['top']+" "+ee.pageY+" "+coords['bottom']);
			return false;
		}
	}
};
return inst;
}])
.factory('uiLibArray', [function() {
var inst ={

	//9.
	/*
	distinguishes between an object/hash (i.e. {'key':'val'}) and (scalar) array (i.e. [1, 2, 3])
	*/
	isArray: function(array1, params) {
	/*	Cannot detect that a scalar array with an undefined first entry is an array
		if(typeof(array1) !='string' && (array1.length !=undefined && (typeof(array1) !='object' || array1[0] !=undefined || array1.length ===0)))	{		//have to ALSO check not object since it could be an object with a "length" key!... update - typeof is object sometimes for arrays??! so now checking array1[0] too/alternatively..
			return true;
		}
	*/
		if(Object.prototype.toString.apply(array1) === "[object Array]")
		{
			return true;
		}
		else {
			return false;
		}
	},
	
	//4.
	/*!
	//TO DO - copying issue where scalar array is being converted to object..?
	By default, arrays/objects are assigned by REFERENCE rather than by value (so var newArray =oldArray means that if you update newArray later, it will update oldArray as well, which can lead to some big problems later). So this function makes a copy by VALUE of an array without these backwards overwriting issues
	Recursive function so can hog memory/performance easily so set "skip keys" when possible
	@param array1 =array/object to copy
	@param params
		skipKeys =1D array of keys to NOT copy (currently only for associative array - wouldn't make a ton of sense otherwise?)
	@return newArray =array/object that has been copied by value
	*/
	copyArray: function(array1, params)
	{
		var newArray, aa;
		if(!array1) {		//to avoid errors if null
			return array1;
		}
		if(!params)
			params ={};
		if(!params.skipKeys || params.skipKeys ===undefined)
			params.skipKeys =[];
		if(typeof(array1) !="object")		//in case it's not an array, just return itself (the value)
			return array1;
		if(this.isArray(array1))
		{
			newArray =[];
			for(aa=0; aa<array1.length; aa++)
			{
				if(array1[aa] && (typeof(array1[aa]) =="object"))
					newArray[aa] =this.copyArray(array1[aa], params);		//recursive call
				else
					newArray[aa] =array1[aa];
			}
		}
		else		//associative array)
		{
			newArray ={};
			for(aa in array1)
			{
				var goTrig =true;
				for(var ss =0; ss<params.skipKeys.length; ss++)
				{
					if(params.skipKeys[ss] ==aa)
					{
						goTrig =false;
						break;
					}
				}
				if(goTrig)
				{
					if(array1[aa] && (typeof(array1[aa]) =="object"))
						newArray[aa] =this.copyArray(array1[aa], params);		//recursive call
					else
						newArray[aa] =array1[aa];
				}
			}
		}
		return newArray;
	},
	
	//1.
	/*
	Returns the index of an 2D []{} associative array when given the key & value to search for within the array
	@param array =2D array []{} to search
	@param key =associative key to check value against
	@param val
	@param params
		oneD =boolean true if it's a 1D array
	*/
	findArrayIndex: function(array, key, val, params)
	{
		var ii;
		//var index =false;		//index can be 0, which evaluates to false
		var index =-1;
		if(params.oneD)
		{
			for(ii=0; ii<array.length; ii++)
			{
				if(array[ii] ==val)
				{
					index =ii;
					break;
				}
			}
		}
		else
		{
			for(ii=0; ii<array.length; ii++)
			{
				if(array[ii][key] ==val)
				{
					index =ii;
					break;
				}
			}
		}
		return index;
	}
	
};
return inst;
}])
;