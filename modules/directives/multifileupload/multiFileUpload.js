/**
@todo
- remove jQuery dependency (currently only for non FormData supported browsers?)
- perhaps remove/replace this plugin with a full implementation of file upload (i.e. INCLUDING the file selection - since we need the form for iFrame fallbacks anyway). OR make this plugin NOT have fallback support and ONLY be for FormData supported browsers?
	- OR modularize out these fallbacks INCLUDING TriggerIO & Phonegap solutions BUT would have to figure out how to conditionally include services/directives? Maybe try ng-if?

NOTE: for cross browser and mobile wrapper (i.e. TriggerIO, Phonegap) support, there's basically 2 distinctions that define the different methods that need to be used:
1. if FormData is supported ( http://caniuse.com/#search=formdata ) - basically Android <=2.3 and IE <=9.0 do NOT support this
2. if a form (with file input fields) are accessible (all non mobile wrapper pages).

File input fields are READ ONLY as it's a security issue to allow writing to / filling a file input field so the ONLY way to take a file as an input parameter then send it somewhere (i.e. to a server) is with FormData. Without that, even with standard form submission, we can't take a file, put it in a new form and submit it (since we can't write to the new file input field).
Fallbacks (if FormData isn't supported) are generally iFrame and Flash. iFrame is more cross browser and requires less dependencies. An example of the iFrame fallback is here ( https://github.com/blueimp/jQuery-File-Upload/blob/master/js/jquery.iframe-transport.js ).
Basically, since you can't copy the file data itself, they append/copy the entire HTML wrapper (which then removes it from it's original form location) then they append it back to the original form when it's done. The iFrame method REQUIRES access to a form (or at least to file input fields created OUTSIDE the plugin (since this plugin/directive) is meant only to upload the files, NOT to actually handle selection of those files.
Other iFrame references:
- http://viralpatel.net/blogs/ajax-style-file-uploading-using-hidden-iframe/
- http://stackoverflow.com/questions/168455/how-do-you-post-to-an-iframe
- http://blog.w3villa.com/programming/upload-image-without-submitting-form-works-on-all-browsers/
- http://stackoverflow.com/questions/9251301/how-add-new-hidden-input-fields-to-the-form-on-submit
- http://stackoverflow.com/questions/6435146/using-javascript-to-set-the-value-of-a-form-element

So the 3 options for file upload, based on FormData support and file input fields are:
1. FormData - AJAX file upload with progress indicators, etc.
	1. conditions: have FormData support. This works whether or not there's access to file input fields.
	2. use cases: everything BUT Android <=2.3 and IE <=9. This DOES work on iOS even inside mobile wrappers such as TriggerIO, Phonegap which don't have form fields (i.e. for native file selection methods).
2. iFrame
	1. conditions: NO FormData but DO have file input fields
	2. use cases: Android <=2.3 and IE <=9 NOT within a mobile wrapper such as TriggerIO, Phonegap
3. native/mobile wrapper file upload solution (NOT handled in this plugin currently)

Uses a $scope.$on('uiMultiFileUploadGo', {instId:xxx, files:[{file:xx}, {file:yy}]}) to initiate uploading one or more files and displays progress (bar). The server response is passed back via a callback function.

//TOC
1. init
2. $scope.$on('uiMultiFileUploadGo',..
4. $scope.uploadFile =function
5. function uploadProgress
6. function uploadComplete
6.25. function ajaxUploadComplete
6.5. function afterComplete
7. function uploadFailed
8. function uploadCanceled


scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
@param {Object} opts
	@param {String} instId Unique identifer for this instance - used for triggering the $scope.$on to initiate the upload
	// @param {Array} files Array of files to upload	//UPDATE: these will be passed in on each $scope.$on
	@param {String} uploadPath Path to upload file to (backend script)
	@param {Object} [serverParamNames] Form names to submit (so can interact with any server).
		@param {String} [files ='files'] The key to use for passing back the files. This will be an array of files.
	@param {Object} [otherData] Key pairs of additional data to send to backend with the request (i.e. {type: 'image'}). NOTE: this SHOULD be a simple / non-nested object.
@param {Function} uploadComplete Function to call after successful upload (all data from server will be passed back as is

attrs
	@param {Number} no-display 1 to NOT show display (upload progress - this will silently handle the upload)

ALSO SEE DOCUMENATION FOR THE 'uiMultiFileUploadGo' function for which parameters it takes as this is the event to call to actually trigger the file upload to start!


@usage
//1. FormData supported browsers
partial / html:
<div ui-multi-file-upload opts='opts' upload-complete='uploadComplete' ></div>

controller / js:
$scope.opts ={
	instId: 'yes',
	uploadPath: '/api/image/upload'
};

$scope.uploadComplete =function(data, params) {
	//do something here
};

//call this function to start the upload
function startUpload() {
	//trigger the upload to start
	$scope.$broadcast('uiMultiFileUploadGo', {instId: $scope.opts.instId, files:[{file:xx}, {file:yy}]});
}





//2. no FormData supported - iFrame used instead
partial / html:
<div ui-multi-file-upload opts='opts' upload-complete='uploadComplete' ></div>

<form id='{{ids.form}}'>
	<input id='{{ids.inputs.file1}}' type='file' />
	<input id='{{ids.inputs.file2}}' type='file' />
</form>

controller / js:
$scope.opts ={
	instId: 'yes',
	uploadPath: '/api/image/upload'
};

$scope.uploadComplete =function(data, params) {
	//do something here
};

$scope.ids ={
	form: 'formId',
	inputs: {
		file1: 'fileInput1',
		file2: 'fileInput2'
	}
};

//call this function to start the upload
function startUpload() {
	//trigger the upload to start
	$scope.$broadcast('uiMultiFileUploadGo', {instId: $scope.opts.instId, formId:$scope.ids.form, files:[{fileInputId: $scope.ids.inputs.file1}, {fileInputId: $scope.ids.inputs.file2}]});
}

//end: EXAMPLE usage
*/

// 'use strict';

angular.module('ui.directives').directive('uiMultiFileUpload', [function () {
  return {
		restrict: 'A',
		scope: {
			opts: '=',
			uploadComplete: '&'
		},

		compile: function(element, attrs) {
			var defaults ={
				showProgress:true,
				noDisplay: 0
			};
			var xx;
			// attrs =angular.extend(defaults, attrs);		//doesn't work.. attrs.id is undefined
			for(xx in defaults) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaults[xx];
				}
			}
			//convert to / ensure number
			attrs.noDisplay =parseInt(attrs.noDisplay, 10);
			
			if(attrs.id ===undefined) {		//would use scope.opts.instId but don't have access to scope yet..
				attrs.id ="uiMultiFileUpload"+Math.random().toString(36).substring(7);
			}
			var id1 =attrs.id;
			var ids ={
				'progress':{
					'barInner':id1+"ProgressBarInner",
					'bar':id1+"ProgressBar"
				},
				'form':{
					// 'form': id1+"Form",
					'input': id1+"FormInput",
					'iframe': id1+"IFrame"
				}
			};
			attrs.ids =ids;		//save for later
			
			var html ="<div>"+
				//hidden iFrame for browsers that don't support formData (Android <=2.3 and IE <=9)
				"<div style='display:none;'>"+
					/*
					//can't copy over file input values/files so have to use EXISTING form (outside this plugin - where the files were actually selected)
					"<form id='"+attrs.ids.form.form+"' action='{{opts.uploadPath}}' method='post' enctype='multipart/form-data' target='"+attrs.ids.form.iframe+"'>"+
						// "<input type='file' ng-repeat='file in files' id='{{file.id}}' name='{{file.name}}' />"+		//doesn't work - you can't set file input values due to security reasons..
						"<input type='text' ng-repeat='(key, value) in opts.otherData' name='{{key}}' value='{{value}}' />"+
					"</form>"+
					*/
					"<iframe id='"+attrs.ids.form.iframe+"' name='"+attrs.ids.form.iframe+"' style='display:none;'></iframe>"+
				"</div>"+
				"<div ng-hide='"+attrs.noDisplay+"'>"+
					"<div ng-show='showLoading' class='ui-multi-file-upload-loading center'>Loading..</div>"+
					"<div id='"+attrs.ids.progress.bar+"' class='ui-multi-file-upload-progress-bar'><div id='"+attrs.ids.progress.barInner+"' class='ui-multi-file-upload-progress-bar-inner'>&nbsp;</div></div>"+
					"<div>{{progressNumber}}</div>"+
					// "<div>{{fileInfo.name}}</div>"+
					// "<div>{{fileInfo.size}}</div>"+
					// "<div>{{fileInfo.type}}</div>"+
				"</div>"+
			"</div>";
			element.replaceWith(html);
		},
		
		controller: function($scope, $element, $attrs) {
			var defaultOpts ={
				serverParamNames:{
					files: 'files'
				}
			};
			$scope.opts =angular.extend(defaultOpts, $scope.opts);
			
			$scope.showLoading =false;
				
			/**
			@toc 1.
			@method init
			*/
			function init(params) {
			}
			
			/**
			@toc 2.
			$scope.$on('uiMultiFileUploadGo',..
			@param {Object} params
				@param {String} instId
				@param {Array} files Array of objects with at least a 'file' key for the files to upload (should be an array of local file names OR file data). Each item is an object of:
					@param {String|File} file The file to upload. Not actually required for iFrame implementation.
					@param {String} [fileInputId] [IFRAME ONLY] The string of the input element where the file is (if given, will set the 'name' of this input according $scope.opts.serverParamNames.files). Otherwise, the form will be submitted with the names given for the form inputs ('name' field MUST exist for each input!).
				@param {String} [formId] [IFRAME ONLY - REQUIRED FOR IFRAME] The id of the form where the files were selected; this form will be altered then submitted (to an iFrame defined here).
			*/
			$scope.$on('uiMultiFileUploadGo', function(evt, params) {
				if($scope.opts.instId !==undefined && params.instId !==undefined && $scope.opts.instId ==params.instId) {		//only update if the correct instance
					if(params.files.length >0) {
						$scope.uploadFiles(params);
					}
					else {
						console.log('multiFileUpload: no files selected');
					}
				}
			});
			
			/**
			IFRAME ONLY
			@method addHiddenInput
			*/
			function addHiddenInput(form, key, value) {
				// Create a hidden input element, and append it to the form:
				var input = document.createElement('input');
				input.type = 'hidden';
				input.name = key;
				input.value = value;
				form.appendChild(input);
			}
			
			/**
			@toc 4.
			@method $scope.uploadFiles
			@param {Object} params
				@param {Array} files Array of objects with at least a 'file' key for the files to upload (should be an array of local file names OR file data). Each item is an object of:
					@param {String|File} file The file to upload
					@param {String} [fileInputId] [IFRAME ONLY] The string of the input element where the file is (if given, will set the 'name' of this input according $scope.opts.serverParamNames.files). Otherwise, the form will be submitted with the names given for the form inputs ('name' field MUST exist for each input!).
				@param {String} [formId] [IFRAME ONLY - REQUIRED FOR IFRAME] The id of the form where the files were selected; this form will be altered then submitted (to an iFrame defined here).
			*/
			$scope.uploadFiles =function(params) {
				var ii, xx;
				// if(FormData ===undefined || !FormData) {		//throws error
				if(!window.FormData || window.FormData ===undefined) {
				// if(1) {		//TESTING
					if(params.formId ===undefined || !params.formId) {
						console.log('multiFileUpload: ERROR: no FormData; params.formId is REQUIRED');
					}
					else {		//valid
						console.log('multiFileUpload: no FormData, using iFrame');
						
						var form =document.getElementById(params.formId);
						console.log('form: '+form);
						
						//can't set files via javascript due to security so have to just use existing file input's and set their 'name' attribute correctly
						//form input id's/name's of fields IF fileInputId param is set
						for(ii =0; ii<params.files.length; ii++) {
							if(params.files[ii].fileInputId !==undefined) {
								angular.element(document.getElementById(params.files[ii].fileInputId)).attr('name', $scope.opts.serverParamNames.files+'['+ii+']');
							}
						}
						
						//add other data (if any)
						if($scope.opts.otherData !==undefined) {
							for(xx in $scope.opts.otherData) {
								if(form[xx] !==undefined) {
									form[xx].value =$scope.opts.otherData[xx];
								}
								else {		//have to add input to the form
									addHiddenInput(form, xx, $scope.opts.otherData[xx]);
								}
							}
						}
						
						//set/update form properties (action, target, etc.)
						//"<form id='"+attrs.ids.form.form+"' action='{{opts.uploadPath}}' method='post' enctype='multipart/form-data' target='"+attrs.ids.form.iframe+"'>"+
						form.setAttribute('target', $attrs.ids.form.iframe);
						form.setAttribute('action', $scope.opts.uploadPath);
						form.setAttribute('method', 'post');
						form.setAttribute('enctype', 'multipart/form-data');
						// form.setAttribute('encoding', 'multipart/form-data');
						
						form.submit();
						
						$scope.showLoading =true;

						var iframeId =document.getElementById($attrs.ids.form.iframe);
						
						// Add event...
						var eventHandler = function () {

							var content;
							if (iframeId.detachEvent) iframeId.detachEvent("onload", eventHandler);
							else iframeId.removeEventListener("load", eventHandler, false);

							// Message from server...
							if (iframeId.contentDocument) {
								content = iframeId.contentDocument.body.innerHTML;
							} else if (iframeId.contentWindow) {
								content = iframeId.contentWindow.document.body.innerHTML;
							} else if (iframeId.document) {
								content = iframeId.document.body.innerHTML;
							}

							//strip any bad leading/trailing characters
							if(content[0] !=='{' || content[(content.length-1)] !='}') {		//check first & last characters
								content =content.slice(content.indexOf('{'), content.lastIndexOf('}')+1);
							}
					
							var data = JSON.parse(content);  // Content of the iframe will be the response sent from the server. Parse the response as the JSON object
							console.log('result: '+JSON.stringify(data));
							afterComplete({}, data);
						};

						if (iframeId.addEventListener) iframeId.addEventListener("load", eventHandler, true);
						if (iframeId.attachEvent) iframeId.attachEvent("onload", eventHandler);

						/*
						$('#'+$attrs.ids.form.iframe).unbind().load(function() {  // This block of code will execute when the response is sent from the server.
							var data = JSON.parse($(this).contents());  // Content of the iframe will be the response sent from the server. Parse the response as the JSON object
							console.log('result: '+JSON.stringify(data));
							afterComplete({}, data);
						});
						*/
					}
				}
				else {
					$scope.showLoading =true;
					//show progress / loading
					angular.element(document.getElementById($attrs.ids.progress.barInner)).css({'width':'0%'});
					if($attrs.showProgress) {
						var eleProgressBar =angular.element(document.getElementById($attrs.ids.progress.bar));
						eleProgressBar.removeClass('complete');
						eleProgressBar.addClass('loading');
					}
					else {
						$scope.showLoading =true;
					}
				
					var fd = new FormData();
					//add files data
					for(ii =0; ii<params.files.length; ii++) {
						fd.append($scope.opts.serverParamNames.files+'['+ii+']', params.files[ii].file);
					}
					
					//add other data (if any)
					if($scope.opts.otherData !==undefined) {
						for(xx in $scope.opts.otherData) {
							fd.append(xx, $scope.opts.otherData[xx]);
						}
					}
					
					var xhr = new XMLHttpRequest();
					if($attrs.showProgress) {
						xhr.upload.addEventListener("progress", uploadProgress, false);
					}
					xhr.onload =function(ee){uploadComplete(ee, params); };
					//xhr.addEventListener("load", uploadComplete, false);
					xhr.onerror =function(ee){uploadFailed(ee, params); };		//doesn't seem to work..
					//xhr.addEventListener("error", uploadFailed, false);		//doesn't seem to work..
					xhr.addEventListener("abort", uploadCanceled, false);
					xhr.open("POST", $scope.opts.uploadPath);
					xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
					xhr.onreadystatechange =function(){
						if(xhr.readyState ==4 && xhr.status !=200)
						{
							uploadFailed('', params);
						}
					};
					xhr.send(fd);
				}
			};
			
			/**
			@toc 5.
			@method uploadProgress
			*/
			function uploadProgress(evt) {
				if (evt.lengthComputable) {
					var percentComplete = Math.round(evt.loaded * 100 / evt.total);
					$scope.progressNumber =percentComplete.toString() + '%';
					document.getElementById($attrs.ids.progress.barInner).style.width = percentComplete.toString() +'%';
				}
				else {
					$scope.progressNumber = 'unable to compute';
				}
			}
			
			/**
			@toc 6.
			@method uploadComplete
			@param params
				callback =array {'evtName':string, 'args':[]}
				uploadFileSimple =boolean true if no display
			*/
			function uploadComplete(evt, params) {
				/* This event is raised when the server send back a response */
				//alert(evt.target.responseText);
				
				document.getElementById($attrs.ids.progress.barInner).style.width = '100%';
				
				var ele1 =angular.element(document.getElementById($attrs.ids.progress.bar));
				ele1.addClass('complete');
				
				$scope.progressNumber ='';

				var data =JSON.parse(evt.target.responseText);
				afterComplete(params, data);
			}
			
			/**
			@toc 6.25.
			@method ajaxUploadComplete
			*/
			function ajaxUploadComplete(params, data) {
				if(typeof(data) =='string') {
					data =$.parseJSON(data);
				}
				afterComplete(params, data);
			}
			
			/**
			@toc 6.5.
			@method afterComplete
			*/
			function afterComplete(params, data) {
				$scope.showLoading =false;
				
				//call callback function passed in (if exists)
				if($scope.uploadComplete !==undefined && $scope.uploadComplete() !==undefined && typeof($scope.uploadComplete()) =='function') {		//this is an optional scope attr so don't assume it exists
					$scope.uploadComplete()(data, params);
				}
				
				//ensure back in angular world so events fire now
				if(!$scope.$$phase) {
					$scope.$apply();
				}
			}
			
			/**
			@toc 7.
			@method uploadFailed
			*/
			function uploadFailed(evt) {
				alert("There was an error attempting to upload the file. Please try again or try a different file.");
				//LLoading.close({});
			}

			/**
			@toc 8.
			@method uploadCanceled
			*/
			function uploadCanceled(evt) {
				alert("The upload has been canceled by the user or the browser dropped the connection.");
				//LLoading.close({});
			}
		}
	};
}]);