//Copyright 2017. INFOCG Inc. all rights reserved.

sap.ui.define("u4a.m.RichEditor", [
"sap/ui/core/Control",

], function(Control){
    "use strict";

    var RichEditor = Control.extend("u4a.m.RichEditor", {
        metadata : {
            library : "u4a.m",
            properties : {
                width : { type: "string", defaultValue: "100%" },
                height : { type: "string", defaultValue: "100%" },
                value : { type: "string", defaultValue: null },
                editable : {type : "boolean", defaultValue : true }
            }

        }, // end of metadata

        init : function(){
            this._oEditorInfo = {};
        },

        renderer : function(oRm, oControl){

            var oEditerInfo = oControl._oEditorInfo;
                oEditerInfo.editorId = oControl.getId();
                oEditerInfo.editorContainerId = oEditerInfo.editorId + "-container";

            oRm.openStart("div", oControl);
            oRm.class("u4aRichEditor");
            oRm.style("width", oControl.getWidth());
            oRm.style("height", oControl.getHeight());
            oRm.style("display", "flex");
            oRm.style("flex-direction", "column");

            oRm.openEnd();

            oRm.openStart("div");
            oRm.attr("id", oEditerInfo.editorContainerId);
            oRm.style("min-height", "1px");
            oRm.openEnd();

            oRm.close("div");

            oRm.close("div");

        }, // end of renderer

        onAfterRendering : function(){

            // editor 테마 css file load
            this._loadCssTheme();

            // editor Library file load
            this._loadLibFiles();

            // Editor Init
            this._setInitSettings();

        }, // end of onAfterRendering

        _loadCssTheme : function(){

            // css file load
            var sEditorCssDomId = "u4aRichEditor_style",
                oEditorCssDom = document.getElementById(sEditorCssDomId);

            if(!oEditorCssDom){
                jQuery.ajax({
                    url: "/zu4a_imp/tools/quill/u4aRichEditor.snow.css",
                    dataType: "text",
                    async: false,
                    mimeType : "text/css",
                    success: function(cssData){
                        if(cssData == ""){
                            throw new Error('[U4AIDE] Load Fail to u4aRichEditor css files');
                        }

                        var oU4aCss = ".sap-phone .u4aRichEditor,";
                            oU4aCss += ".sap-phone .u4aRichEditor *,";
                            oU4aCss += ".sap-ios .u4aRichEditor,";
                            oU4aCss +=  ".sap-ios .u4aRichEditor * {";
                            oU4aCss += "-webkit-user-select : text !important;";
                            oU4aCss += "-moz-user-select : text !important;";
                            oU4aCss += "-ms-user-select : text !important;";
                            oU4aCss += "user-select : text !important;";
                            oU4aCss += "-webkit-user-drag : none !important;";
                            oU4aCss += "}";
                            cssData += oU4aCss;

                        $("<style id='" + sEditorCssDomId + "'></style>").appendTo("head").html(cssData);
                    },
                    error : function(e){
                        throw new Error('[U4AIDE] Load Fail to u4aRichEditor css files');
                    }
                });
            }

        },

        _loadLibFiles : function(){

            try {
                var oQuill = Quill;
            }
            catch(ex){
                jQuery.u4aJSloadAsync("/zu4a_imp/tools/quill/u4aRichEditor.min.js", function(){});
            }

        },

        _setInitSettings : function(){

             var toolbarOptions = [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': [ 'small', false, 'large', 'huge']}],
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote'],
                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'ltr' }],                         // text direction
                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'align': [] }],
                ['clean']                                         // remove formatting button
           ];

           var that = this,
               oEditerInfo = this._oEditorInfo,

               sEditId = "#" + this.getId(),
               sContainerId = "#" + oEditerInfo.editorContainerId;

           var oQuill = new Quill(sContainerId, {
                   modules: { toolbar: toolbarOptions },
                   theme: 'snow',
                   placeholder: "입력하세요.."
               });

           var oEditor = this.getDomRef(),
               oEditorToolBar = oEditor.firstChild,
               oEditContainer = document.getElementById(oEditerInfo.editorContainerId),
               oEditorContent = oEditContainer.firstChild;

               oEditContainer.addEventListener("focusout", function(oEvent){

                  oEvent.preventDefault();
                  oEvent.stopPropagation();
                  oEvent.stopImmediatePropagation();

                    var oEditorContent = that._oEditContent,
                        oContentText = oEditorContent.innerHTML;

                    that.setProperty("value", oContentText, true);

               });

           $(oEditorToolBar).css("-ms-flex", "0 0 auto");

           this._Quill = oQuill;
           this._oEditToolBar = oEditorToolBar;
           this._oEditContent = oEditorContent;

           // Editable 설정
           this._setEditable(this.getEditable());

           // Value 설정
           this._setValue(this.getValue());

        },

        setValue : function(sHtml){

            this.setProperty("value", sHtml, true);

            var oContent = this._oEditContent;
            if(!oContent){
                return;
            }

                oContent.innerHTML = sHtml;

        },

        _setValue : function(sHtml){

            var oContent = this._oEditContent;

            oContent.innerHTML = sHtml;

        },

        setWidth : function(sWidth){

            this.setProperty("width", sWidth, true);

            var oEditor = this.getDomRef();
            if(!oEditor){
                return;
            }

            oEditor.style.width = sWidth;

        },

        setHeight : function(sHeight){

            this.setProperty("height", sHeight, true);

            var oEditor = this.getDomRef();
            if(!oEditor){
                return;
            }

            oEditor.style.height = sHeight;

        },

        setEditable : function(bEdit){

            this.setProperty("editable", bEdit, true);

            var oEditorContent = this._oEditContent;
            if(!oEditorContent){
                return;
            }

            this._setEditable(bEdit);

        },

        _setEditable : function(bEdit){

            var oEditorContent = this._oEditContent,
                oQuill = this._Quill;

            if(bEdit){
               oEditorContent.style.backgroundColor = "#ffffff";
               oQuill.enable();
            }
            else {
               oEditorContent.style.backgroundColor = "#f7f7f7";
               oQuill.disable();
            }

        }

    });

    return RichEditor;

});