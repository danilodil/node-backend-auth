Type.registerNamespace('Progressive.Agent.Quoting.Web.Aqar');
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService = function() {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.initializeBase(this);
    this._timeout = 0;
    this._userContext = null;
    this._succeeded = null;
    this._failed = null;
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.prototype = {
    _get_path: function() {
        var p = this.get_path();
        if (p) return p;
        else return Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.get_path();
    },
    GetInfo: function(changes, fieldNames, applicationContextIndex, syncId, succeededCallback, failedCallback, userContext) {
        return this._invoke(this._get_path(), 'GetInfo', false, {
            changes: changes,
            fieldNames: fieldNames,
            applicationContextIndex: applicationContextIndex,
            syncId: syncId
        }, succeededCallback, failedCallback, userContext);
    },
    GetHelp: function(updtFld, helpFld, applicationContextIndex, syncId, succeededCallback, failedCallback, userContext) {
        return this._invoke(this._get_path(), 'GetHelp', false, {
            updtFld: updtFld,
            helpFld: helpFld,
            applicationContextIndex: applicationContextIndex,
            syncId: syncId
        }, succeededCallback, failedCallback, userContext);
    },
    CleanupApplication: function(applicationContextIndex, closeType, pageFocusFld, syncId, succeededCallback, failedCallback, userContext) {
        return this._invoke(this._get_path(), 'CleanupApplication', false, {
            applicationContextIndex: applicationContextIndex,
            closeType: closeType,
            pageFocusFld: pageFocusFld,
            syncId: syncId
        }, succeededCallback, failedCallback, userContext);
    },
    Authenticate: function(applicationContextIndex, syncId, succeededCallback, failedCallback, userContext) {
        return this._invoke(this._get_path(), 'Authenticate', false, {
            applicationContextIndex: applicationContextIndex,
            syncId: syncId
        }, succeededCallback, failedCallback, userContext);
    },
    UpdatePolicyInfo: function(applicationContextIndex, syncId, succeededCallback, failedCallback, userContext) {
        return this._invoke(this._get_path(), 'UpdatePolicyInfo', false, {
            applicationContextIndex: applicationContextIndex,
            syncId: syncId
        }, succeededCallback, failedCallback, userContext);
    },
    GetVehicleInfo: function(changes, fieldNames, xPath, applicationContextIndex, syncId, succeededCallback, failedCallback, userContext) {
        return this._invoke(this._get_path(), 'GetVehicleInfo', false, {
            changes: changes,
            fieldNames: fieldNames,
            xPath: xPath,
            applicationContextIndex: applicationContextIndex,
            syncId: syncId
        }, succeededCallback, failedCallback, userContext);
    },
    SetRiskType: function(fieldId, isChecked, applicationContextIndex, syncId, succeededCallback, failedCallback, userContext) {
        return this._invoke(this._get_path(), 'SetRiskType', false, {
            fieldId: fieldId,
            isChecked: isChecked,
            applicationContextIndex: applicationContextIndex,
            syncId: syncId
        }, succeededCallback, failedCallback, userContext);
    }
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.registerClass('Progressive.Agent.Quoting.Web.Aqar.FieldInfoService', Sys.Net.WebServiceProxy);
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance = new Progressive.Agent.Quoting.Web.Aqar.FieldInfoService();
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.set_path = function(value) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.set_path(value);
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.get_path = function() {
    return Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.get_path();
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.set_timeout = function(value) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.set_timeout(value);
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.get_timeout = function() {
    return Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.get_timeout();
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.set_defaultUserContext = function(value) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.set_defaultUserContext(value);
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.get_defaultUserContext = function() {
    return Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.get_defaultUserContext();
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.set_defaultSucceededCallback = function(value) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.set_defaultSucceededCallback(value);
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.get_defaultSucceededCallback = function() {
    return Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.get_defaultSucceededCallback();
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.set_defaultFailedCallback = function(value) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.set_defaultFailedCallback(value);
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.get_defaultFailedCallback = function() {
    return Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.get_defaultFailedCallback();
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.set_path("/C2/xSBR001/web.aqar/FieldInfoService.asmx");
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.GetInfo = function(changes, fieldNames, applicationContextIndex, syncId, onSuccess, onFailed, userContext) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.GetInfo(changes, fieldNames, applicationContextIndex, syncId, onSuccess, onFailed, userContext);
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.GetHelp = function(updtFld, helpFld, applicationContextIndex, syncId, onSuccess, onFailed, userContext) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.GetHelp(updtFld, helpFld, applicationContextIndex, syncId, onSuccess, onFailed, userContext);
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.CleanupApplication = function(applicationContextIndex, closeType, pageFocusFld, syncId, onSuccess, onFailed, userContext) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.CleanupApplication(applicationContextIndex, closeType, pageFocusFld, syncId, onSuccess, onFailed, userContext);
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.Authenticate = function(applicationContextIndex, syncId, onSuccess, onFailed, userContext) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.Authenticate(applicationContextIndex, syncId, onSuccess, onFailed, userContext);
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.UpdatePolicyInfo = function(applicationContextIndex, syncId, onSuccess, onFailed, userContext) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.UpdatePolicyInfo(applicationContextIndex, syncId, onSuccess, onFailed, userContext);
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.GetVehicleInfo = function(changes, fieldNames, xPath, applicationContextIndex, syncId, onSuccess, onFailed, userContext) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.GetVehicleInfo(changes, fieldNames, xPath, applicationContextIndex, syncId, onSuccess, onFailed, userContext);
}
Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.SetRiskType = function(fieldId, isChecked, applicationContextIndex, syncId, onSuccess, onFailed, userContext) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService._staticInstance.SetRiskType(fieldId, isChecked, applicationContextIndex, syncId, onSuccess, onFailed, userContext);
}

var g_walkMeUrl;
$(document).ready(function() {
    walkMeReady();
    loadWalkMe()
});
loadWalkMe = function() {
    (function() {
        var walkme = document.createElement("script");
        walkme.type = "text/javascript";
        walkme.async = true;
        walkme.src = g_walkMeUrl;
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(walkme, s);
        window._walkmeConfig = {
            smartLoad: true
        }
    }
    )()
}
;
walkMeReady = function() {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.onload = function() {
        loadWalkMe()
    }
    ;
    $("head").append(s)
}
var g_gtmAccount, g_productCode, g_quoteState, g_sessionId, g_quoteKey, g_quoteNumber, g_agentCode, g_retrieval, g_quoteSource, g_domain = getDomainName(), g_restrictedFieldList, g_polSoldInd, g_appID, g_pageTitle, g_aqarFarPage, g_wasRated, g_vehCount, g_drvrCount, g_uccType;
dataLayer = [{
    sessionID: g_sessionId,
    quoteKey: g_quoteKey,
    quoteState: g_quoteState,
    quoteNumber: g_quoteNumber,
    agentCode: g_agentCode,
    productCode: g_productCode,
    retrieval: g_retrieval,
    quoteSource: g_quoteSource,
    domain: g_domain,
    polSoldIdentifier: g_polSoldInd,
    appID: g_appID,
    pageTitle: g_pageTitle,
    aqarFarPage: g_aqarFarPage,
    wasRated: g_wasRated,
    vehicleCount: g_vehCount,
    driverCount: g_drvrCount,
    uccType: g_uccType
}];
function getDomainName() {
    var domainName = "";
    if (document.domain != null) {
        var parts = document.domain.split(/\./);
        if (parts.length > 1)
            domainName = "." + (parts[parts.length - 2] + "." + parts[parts.length - 1])
    }
    return domainName
}
var gaObject = {};
gaObject["event"] = "virtualPageEvent";
gaObject["virtualPageName"] = window.location.pathname + window.location.search;
dataLayer.push(gaObject);
function LoadGTM() {
    (function(w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({
            "gtm.start": (new Date).getTime(),
            event: "gtm.js"
        });
        var f = d.getElementsByTagName(s)[0]
          , j = d.createElement(s)
          , dl = l != "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "//www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f)
    }
    )(window, document, "script", "dataLayer", g_gtmAccount)
}
var g_changes = [], g_childSelectLists = ["veh_make", "veh_mdl_nam", "veh_sym_sel"], g_disabledClass = "disabled", g_regExpValid = /^[a-zA-Z\d\!\@\#\$\%\&\*\(\)\_\+\-\=\\\:\"\;\'\<\>\?\,\.\/ \n\r]*$/, g_transactionInProcess = false, g_changesQueue = [], g_dependedFieldsQueue = [], g_applicationIndexQueue = [], g_dependantFields = 0, g_controlPrefixes = [""], g_masterPreFunc = null, g_masterPostFunc = null, g_masterindex = null, g_prefixSeparator = "~", g_updatechildFlag = "", pageFieldXML = null, g_changeObj = null, g_lastClearField = null, OnPageErrorsButtonId, onpgEdts, DisplayContinueButtonId, g_closeWindow = true, historyChanged = false, BACKSPACE_KEY = 8, DELETE_KEY = 46, NUMBERPAD_DELETE_KEY = 127;
function hiLiteObj(obj, c) {
    var _cls = c || "";
    obj.className = c
}
function GetFieldHelpText(updtfld, fieldname, fieldsubname) {
    Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.GetHelp(updtfld, fieldname + "_" + fieldsubname, GetQueryStringArgs().applicationContextIndex, GetqueryStringValue("syncId"), OnFieldHelpComplete)
}
function UpdateDependencies(changedObj) {
    var xml = GetPageFieldRelationships()
      , doc = LoadXMLDoc(xml);
    pageFieldXML = doc;
    if (doc == null)
        return;
    var changedFieldId = GetBaseFieldId(changedObj);
    g_changeObj = changedObj;
    var masterXpath = "//f[f and @id='" + changedFieldId + "']"
      , IsDataIslandAttribute = changedObj.getAttribute("DataIsland");
    if (IsDataIslandAttribute != null && IsDataIslandAttribute != undefined && IsDataIslandAttribute == "coveragesExtractFilter")
        FilterDataIsland(changedObj, IsDataIslandAttribute, masterXpath);
    else {
        var masterNodes = doc.selectNodes(masterXpath);
        if (masterNodes != null && masterNodes.length > 0) {
            var dependentFields = PrepareDependantFields(changedObj, masterNodes);
            if (dependentFields.length > 0) {
                var applicationIndex = GetQueryStringArgs().applicationContextIndex;
                QueueAndFireFieldInfo(g_changes, dependentFields, applicationIndex);
                g_changes = [];
                g_lastClearField = null
            }
        }
    }
}
function PrepareDependantFields(changedObj, masterNodes) {
    for (var dependentFields = [], m = 0; m < masterNodes.length; ++m)
        if (ShouldAddDependentFields(masterNodes[m], changedObj)) {
            g_masterPreFunc = masterNodes[m].getAttribute("prefunc");
            g_masterPostFunc = masterNodes[m].getAttribute("postfunc");
            g_updatechildFlag = masterNodes[m].getAttribute("updatechild");
            var dependentNodes = masterNodes[m].selectNodes(".//f");
            if (dependentNodes != null)
                for (var d1 = 0, d = 0; d < dependentNodes.length; ++d)
                    if (changedObj.CustomFilter == "True" && GetObjValue("prod_cd") == "CA")
                        AddDependentFieldsCA(dependentFields, dependentNodes[d], changedObj.id);
                    else
                        AddDependentFields(dependentFields, dependentNodes[d], changedObj.id)
        }
    return dependentFields
}
function VisitDependent(filter, masterField, master) {
    var doc = IsLegacyIE() ? document.getElementById(filter) : LoadXMLDoc(document.getElementById(filter).textContent);
    if (master == null)
        var xPath = "//filters/filter/options[@name='" + GetFieldName(masterField, ".") + "']";
    else {
        for (var xPath = "//filters/filter/options", masterobjects = master.split(","), i = 0; i < masterobjects.length; i++)
            if (masterobjects[i] != "") {
                var _obj = GetObj(ParseGroup(masterField.id) + "." + GetEntityIndices(masterField.id) + "." + masterobjects[i]);
                xPath += "[@name='";
                xPath += masterobjects[i];
                xPath += "']/option[@value='";
                xPath += _obj.value;
                xPath += "']/options"
            }
        xPath += "[@name='";
        xPath += GetFieldName(masterField, ".");
        xPath += "']/option[@value='";
        xPath += masterField.value;
        xPath += "']/options"
    }
    var options = doc.selectNodes(xPath);
    if (options.length > 0)
        for (var i = 0; i < options.length; i++) {
            var dependentFieldId = ParseGroup(masterField.id) + "." + GetEntityIndices(masterField.id) + "." + options[i].getAttribute("name")
              , masterNodes = GetMasterNode(options[i].getAttribute("name"));
            if (masterNodes != null && masterNodes.length > 0)
                var master = masterNodes[0].getAttribute("master")
                  , dependentnode = masterNodes[0].getAttribute("dependent");
            FillDependentOptions(GetObj(dependentFieldId), doc, xPath, master, dependentnode)
        }
}
function RunClientFilter(changedObj, masterNode, dataIslandFilter) {
    var sibling = masterNodes[0].getAttribute("Sibling")
      , master = masterNodes[0].getAttribute("master")
      , dependent = masterNodes[0].getAttribute("dependent");
    VisitDependent(dataIslandFilter, changedObj, master, dependent);
    VisitSiblings(changedObj, sibling);
    LoopAllMainCovsforTrailer()
}
function ShouldCopySiblings(covField) {
    var shouldCopySiblings = "false";
    shouldCopySiblings = covField.getAttribute("CopySiblings");
    return shouldCopySiblings
}
function VisitSiblings(masterField, sibling) {
    var baseName = masterField.id.split(".");
    if (sibling == "Yes")
        for (var j = 1; j < 99; j++) {
            var idxFldName = baseName[0] + "." + j + "." + baseName[2]
              , idxFld = GetObj(idxFldName);
            if (idxFld == null)
                return;
            var CopySiblings = ShouldCopySiblings(idxFld);
            if (idxFld.disabled == true && CopySiblings == "true") {
                EnableCovField(idxFld);
                CopyOptions(masterField, idxFld);
                DisableCovField(idxFld);
                var masterNodes = GetMasterNode(baseName[2]);
                if (masterNodes != null && masterNodes.length > 0) {
                    var dataIslandFilter = masterNodes[0].getAttribute("DataIslandFilter")
                      , master = masterNodes[0].getAttribute("master")
                      , dependent = masterNodes[0].getAttribute("dependent");
                    VisitDependent(dataIslandFilter, idxFld, master, dependent)
                }
            }
        }
}
function CopyOptions(masterField, destField) {
    var _obj = destField.length > 0 && typeof destField.options == "undefined" ? destField[0] : destField
      , _bIsRadio = _obj.className == "clsRadioList" ? true : false
      , options = masterField.options;
    if (options == null)
        return 0;
    var kids = options;
    if (_bIsRadio)
        return;
    else {
        var coll = _obj;
        ClearOptions(coll);
        for (var newOption = null, i = 0; i < kids.length; i++) {
            var opt = kids[i];
            newOption = document.createElement("OPTION");
            if (opt.text != null)
                newOption.text = opt.text;
            else
                newOption.text = opt.getAttribute("value");
            newOption.value = opt.getAttribute("value");
            coll.options.add(newOption)
        }
        _obj.selectedIndex = -1;
        _obj.selectedIndex = masterField.selectedIndex;
        _obj.value = masterField.value
    }
}
function AddDependentFields(dependentFields, dependentNode, masterFieldId) {
    var masterIndices = GetEntityIndices(masterFieldId)
      , dependentFieldId = dependentNode.getAttribute("id")
      , entities = dependentNode.getAttribute("entities");
    g_masterindex = masterIndices;
    if (!entities)
        entities = ".";
    for (var parts = dependentFieldId.split("/"), fieldName = parts[0], p = 1; p < parts.length; p++) {
        var index = "*";
        if (entities != "*" && p <= masterIndices.length)
            index = masterIndices[p - 1];
        fieldName += "." + index + "." + parts[p]
    }
    if (fieldName.indexOf("*") > 0) {
        var parts = fieldName.split(".");
        ExpandFields(parts, 0, dependentFields, null)
    } else
        for (var prefixes = GetControlPrefixes(), j = 0; j < prefixes.length; j++) {
            var controlId = GetUniqueId(prefixes[j], fieldName)
              , currObj = GetObj(controlId);
            if (currObj) {
                dependentFields.push(fieldName);
                dependentFields.push("RO");
                break
            }
        }
    return
}
function AddDependentFieldsCA(dependentFields, dependentNode, masterFieldId) {
    var masterIndices = GetEntityIndices(masterFieldId)
      , dependentFieldId = dependentNode.getAttribute("id")
      , entities = dependentNode.getAttribute("entities");
    g_masterindex = masterIndices;
    if (!entities)
        entities = ".";
    for (var parts = dependentFieldId.split("/"), fieldName = parts[0], p = 1; p < parts.length; p++) {
        var index = "*";
        if (entities != "*" && p <= masterIndices.length)
            index = masterIndices[p - 1];
        fieldName += "." + index + "." + parts[p]
    }
    var oldindex = 0;
    if (masterFieldId.split(".")[0] == "VEH") {
        var veh_cnt = Number(GetObj("VEH.count").value);
        for (i = 0; i < veh_cnt; i++) {
            if (i == 0) {
                fieldName = fieldName.replace("*", i);
                oldindex = i
            } else {
                fieldName = fieldName.replace(oldindex, i);
                oldindex = i
            }
            ContinueAddDependantsCA(fieldName, dependentFields)
        }
    } else {
        fildName = fieldName.replace("*", "0");
        ContinueAddDependantsCA(fieldName, dependentFields)
    }
    return
}
function ContinueAddDependantsCA(fieldName, dependentFields) {
    for (var prefixes = GetControlPrefixes(), j = 0; j < prefixes.length; j++) {
        var controlId = GetUniqueId(prefixes[j], fieldName)
          , currObj = GetObj(controlId);
        if (currObj) {
            for (var found = false, index = 0; index < dependentFields.length; index++)
                if (dependentFields[index] == fieldName) {
                    found = true;
                    break
                }
            if (!found) {
                dependentFields.push(fieldName);
                dependentFields.push("RO")
            }
        }
    }
}
function QueueAndFireFieldInfo(changes, dependentFields, applicationIndex) {
    g_changesQueue.push(changes);
    g_dependedFieldsQueue.push(dependentFields);
    g_applicationIndexQueue.push(applicationIndex);
    ProcessQueue()
}
function ProcessQueue() {
    if (UpdatePanelInProcess()) {
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(FieldInfoUpdatePanelCallback);
        return
    }
    getIEVersionNumber() == 6 && HideIframeWhenFieldsAreUpdated();
    if (g_changesQueue.length > 0) {
        if (!g_transactionInProcess)
            try {
                g_transactionInProcess = true;
                g_dependantFields = g_dependedFieldsQueue.shift();
                var changes = g_changesQueue.shift();
                if (g_masterPreFunc != null)
                    if (eval(g_masterPreFunc + "('" + g_masterindex + "');") == false) {
                        g_transactionInProcess = false;
                        return
                    }
                DisableDependantFields(g_dependantFields);
                DebugRequest(changes, g_dependantFields);
                Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.GetInfo(changes, g_dependantFields, g_applicationIndexQueue.shift(), GetqueryStringValue("syncId"), OnFieldInfoComplete, OnFieldInfoError)
            } catch (e) {
                CleanUpFieldInfoTransaction();
                alert(e.message)
            }
    } else
        g_transactionInProcess = false
}
function FieldInfoInProcess() {
    return g_transactionInProcess
}
function FieldInfoUpdatePanelBegin() {
    g_changes = [];
    g_changesQueue = [];
    g_dependedFieldsQueue = [];
    g_applicationIndexQueue = []
}
function FieldInfoUpdatePanelCallback() {
    Sys.WebForms.PageRequestManager.getInstance().remove_endRequest(FieldInfoUpdatePanelCallback);
    ProcessQueue()
}
function ExpandFields(groupNames, startPos, fields, parent) {
    var groupCount = "";
    if (startPos == 0)
        groupCount = groupNames[startPos] + ".count";
    else
        groupCount = parent + groupNames[startPos] + ".count";
    var group = GetObj(groupCount);
    if (group == null)
        return;
    var start = 0
      , last = group.value;
    if (groupNames[startPos + 1] != "*") {
        var index = groupNames[startPos + 1];
        start = index;
        if (index < last)
            last = index + 1
    }
    for (var i = start; i < last; i++)
        if (startPos == groupNames.length - 3) {
            var field = groupNames[startPos] + "." + i + "." + groupNames[groupNames.length - 1];
            if (parent != null) {
                field = parent + field;
                field = field.replace(/[/]/g, ".")
            }
            for (var currObj, prefixes = GetControlPrefixes(), j = 0; j < prefixes.length; j++) {
                var tempField = GetUniqueId(prefixes[j], field);
                currObj = GetObj(tempField);
                if (currObj != null)
                    break
            }
            if (currObj) {
                fields.push(field);
                fields.push("RO")
            }
        } else {
            var oldparent = parent;
            if (parent == null)
                parent = "";
            parent += groupNames[startPos] + "." + i + "/";
            ExpandFields(groupNames, startPos + 2, fields, parent);
            parent = oldparent
        }
}
function HideIframeWhenFieldsAreUpdated() {
    var iframe = GetObj("expandList~iframe");
    iframe.style.width = 0 + "px";
    iframe.style.height = 0 + "px"
}
function DisableDependantFields(fieldList) {
    var Updating = "Updating...";
    getIEVersionNumber() == 6 && HideIframeWhenFieldsAreUpdated();
    for (var i = 0; i < fieldList.length; i++)
        for (var prefixes = GetControlPrefixes(), fieldId = fieldList[i], j = 0; j < prefixes.length; j++) {
            var controlId = GetUniqueId(prefixes[j], fieldId)
              , currObj = GetObj(controlId);
            if (currObj)
                if (currObj.value != Updating && (currObj.tagName == "SELECT" || currObj.tagName == "INPUT")) {
                    currObj.prevValue = currObj.value;
                    currObj.prevDisabled = currObj.disabled;
                    ToggleFieldRelevance(currObj, false);
                    if (currObj.options != null) {
                        var e = CreateOptionElement(Updating, Updating);
                        currObj.options.add(e)
                    }
                    currObj.value = Updating
                }
        }
}
function EnableDependantFields(fieldList) {
    for (var i = 0; i < fieldList.length; i++)
        for (var prefixes = GetControlPrefixes(), fieldId = fieldList[i], j = 0; j < prefixes.length; j++) {
            var controlId = GetUniqueId(prefixes[j], fieldId)
              , currObj = GetObj(controlId);
            if (currObj) {
                !currObj.prevDisabled && ToggleFieldRelevance(currObj, true);
                currObj.value = currObj.prevValue;
                currObj.prevDisabled = "";
                if (currObj.options != null)
                    currObj.options.length > 0 && currObj.options.remove(currObj.options.length - 1)
            }
        }
}
function CleanUpFieldInfoTransaction() {
    try {
        EnableDependantFields(g_dependantFields)
    } catch (e) {
        alert(e.message)
    } finally {
        g_dependantFields = 0;
        g_transactionInProcess = false
    }
}
function OnFieldHelpComplete(result) {
    try {
        if (result == "SessionExpired")
            window.location = "sessionexpired.htm";
        else {
            var pos = result.indexOf("!")
              , obj = document.getElementById(result.substring(0, pos));
            obj.innerHTML = result.substring(pos + 1)
        }
    } catch (e) {
        CleanUpFieldInfoTransaction();
        alert(e.message)
    }
}
function xmlToString(xmlData) {
    var xmlString;
    xmlString = xmlData.xml;
    if (xmlString == undefined)
        xmlString = (new XMLSerializer).serializeToString(xmlData);
    return xmlString
}
function OnFieldInfoComplete(result) {
    try {
        if (result == "SessionExpired")
            window.location = "SessionExpired.htm";
        else {
            EnableDependantFields(g_dependantFields);
            g_dependantFields = 0;
            var rsp;
            try {
                rsp = new ActiveXObject("Microsoft.XMLDOM");
                rsp.async = false;
                rsp.preserveWhiteSpace = true;
                rsp.loadXML(result)
            } catch (exc) {
                if (exc.message.indexOf("ActiveX") > -1)
                    rsp = (new DOMParser).parseFromString(result, "text/xml");
                else
                    throw exc
            }
            Debug(xmlToString(rsp), "rsDebug");
            for (var fieldNodes = rsp.documentElement.selectNodes("f"), f = 0; f < fieldNodes.length; ++f)
                for (var fieldNode = fieldNodes[f], fieldId = fieldNode.getAttribute("id"), prefixes = GetControlPrefixes(), i = 0; i < prefixes.length; i++) {
                    var controlId = GetUniqueId(prefixes[i], fieldId);
                    FillDependantObj(controlId, fieldNode)
                }
        }
        g_transactionInProcess = false;
        ProcessQueue();
        if (g_updatechildFlag == "d") {
            var focusObj = GetObj(g_lastFocusFieldId);
            focusObj && focusObj.disabled == false && focusObj.focus()
        }
        if (g_masterPostFunc != null)
            if (eval("typeof(" + g_masterPostFunc + ")") == "function")
                eval(g_masterPostFunc + "('" + g_masterindex + "');");
        PageFieldInfoCompleteProcess()
    } catch (e) {
        CleanUpFieldInfoTransaction();
        alert(e.message)
    }
}
function PageFieldInfoCompleteProcess() {
    CallIfFunctionExists("PageFieldInfoComplete" + g_currentPage)
}
function GetUniqueId(prefix, fieldId) {
    var controlId = prefix;
    if (controlId != "")
        controlId += g_prefixSeparator;
    controlId += fieldId;
    return controlId
}
function GetControlSpecificObj(id) {
    var obj = GetObj(id);
    if (obj == null)
        return;
    if (IsCheckBoxControl(id))
        obj = GetObj(id + "_displayCheckBox");
    return obj
}
function FillDependantObj(id, fieldNode) {
    var obj = GetControlSpecificObj(id);
    if (obj == null)
        return;
    var relNode = fieldNode.selectSingleNode("r")
      , optionNodes = fieldNode.selectNodes("o");
    if (relNode != null)
        switch (GetNodeTextFromNode(relNode)) {
        case "R":
            ToggleFieldRelevance(obj, true);
            break;
        case "I":
            ToggleFieldRelevance(obj, false);
            break;
        case "U":
            var treatUnknownAs = "";
            if (IsRadioButton(obj)) {
                var radObj = GetRadioObject(obj);
                treatUnknownAs = GetAttribute(radObj, "TreatUnknownRelevanceAs")
            } else
                treatUnknownAs = GetAttribute(obj, "TreatUnknownRelevanceAs");
            if (treatUnknownAs == "Irrelevant")
                ToggleFieldRelevance(obj, false);
            else
                ToggleFieldRelevance(obj, true)
        }
    var valueNode = fieldNode.selectSingleNode("v")
      , externalValueNode = fieldNode.selectSingleNode("e");
    if (obj.tagName == "SELECT") {
        GetObjValue("prod_cd") != "CV" && ValidateOptions(obj, optionNodes, valueNode);
        var optionGroup = obj.getAttribute("OptionGroup");
        if (optionGroup == "true" && getIEVersionNumber() == 0)
            FillTabletOptions(obj, optionNodes, valueNode);
        else
            FillOptions(obj, optionNodes, valueNode)
    }
    valueNode != null && SetFieldValue(obj, GetNodeTextFromNode(valueNode), GetNodeTextFromNode(externalValueNode));
    if (g_updatechildFlag == "d" && obj.tagName == "SELECT") {
        if (obj.options.length == 1 && obj.options[0].value != obj.value) {
            SetFieldValue(obj, obj.options[0].value, null);
            FldOnChange(obj, true)
        } else if (obj.options.length == 2 && obj.options[0].value == "" && obj.options[1].value != obj.value) {
            SetFieldValue(obj, obj.options[1].value, null);
            FldOnChange(obj, true)
        }
        var mastersArrary = GetMasters(obj.id);
        mastersArrary.length > 0 && LoadFillOptions(obj, mastersArrary)
    }
}
function OnFieldInfoError(result) {
    CleanUpFieldInfoTransaction();
    if (result.get_timedOut())
        alert("FieldInfoService Timeout: " + result.get_message());
    else {
        var suppressMsg = result.get_statusCode() === 0 && GetObjValue("mobiledevice_ind") === "Y";
        !suppressMsg && alert("FieldInfoService Error(" + result.get_statusCode() + "): " + result.get_message())
    }
}
function ToggleFieldRelevance(field, relevant) {
    var parentDiv = null
      , isRadioButton = false
      , isHide = GetAttribute(field, "IrrelevantBehavior") == "Hide";
    if (IsRadioButton(field)) {
        isRadioButton = true;
        var radObj = GetRadioObject(field);
        isHide = GetAttribute(radObj, "IrrelevantBehavior") == "Hide"
    }
    if (IsCheckBoxControl(field)) {
        var cbObj = GetCheckBoxObject(field);
        isHide = GetAttribute(cbObj, "IrrelevantBehavior") == "Hide"
    }
    if (isHide) {
        parentDiv = GetObj(field.id + "_div");
        if (parentDiv == null)
            parentDiv = $get(field.id + "_tr");
        if (parentDiv != null) {
            $common.setVisible(parentDiv, relevant);
            errorRow = $get(field.id + "_tr_error");
            errorRow != null && $common.setVisible(errorRow, false)
        }
    }
    if (field.attributes["RuleDisable"]) {
        var ruleBasedDisable = field.attributes["RuleDisable"].value;
        ruleBasedDisable == "True" && Sys.UI.DomElement.addCssClass(field, g_disabledClass)
    } else {
        field.disabled = !relevant;
        var radioColl;
        if (isRadioButton)
            radioColl = GetRadioCollection(field);
        if (relevant) {
            Sys.UI.DomElement.removeCssClass(field, g_disabledClass);
            EnableControl(field, false);
            isRadioButton && EnableRadioCollection(radioColl)
        } else {
            Sys.UI.DomElement.addCssClass(field, g_disabledClass);
            EnableControl(field, true);
            isRadioButton && DisableRadioCollection(radioColl)
        }
        if (IsButton(field))
            EnableButton(field, relevant);
        else
            EnableIfDisplayButtonDialog(field, relevant)
    }
}
function EnableIfDisplayButtonDialog(field, relevant) {
    if (field.parentNode != null && field.parentNode.id == "_dbdWrapper")
        if (relevant) {
            Sys.UI.DomElement.removeCssClass(field.parentNode, g_disabledClass);
            var button = document.getElementById(field.id + "-button");
            if (button) {
                button.disabled = false;
                if (button.attributes["enabledimage"])
                    button.src = button.attributes["enabledimage"].value;
                Sys.UI.DomElement.removeCssClass(button, g_disabledClass)
            }
        } else {
            Sys.UI.DomElement.addCssClass(field.parentNode, g_disabledClass);
            var button = document.getElementById(field.id + "-button");
            if (button) {
                Sys.UI.DomElement.addCssClass(button, g_disabledClass);
                if (button.attributes["disabledimage"])
                    button.src = button.attributes["disabledimage"].value;
                button.disabled = true
            }
        }
}
function EnableButton(field, flag) {
    if (flag)
        field.src = field.attributes["enabledimage"].value;
    else
        field.src = field.attributes["disabledimage"].value
}
function EnableControl(field, flag) {
    IsCheckBoxControl(field) && EnableCheckbox(field, flag)
}
function IsCheckBoxControl(field) {
    if (field.type == "hidden") {
        var control = GetObj(field.id + "_displayCheckBox");
        if (control != null && control != undefined)
            if (control.type == "checkbox")
                return true
    }
    return false
}
function GetFieldId(obj) {
    if (obj != null && obj != undefined) {
        var fieldIdParts = obj.id.split(g_prefixSeparator);
        return fieldIdParts[fieldIdParts.length - 1]
    }
}
function EnableCheckbox(field, flag) {
    var control = GetObj(field.id + "_displayCheckBox");
    control.disabled = flag;
    if (flag)
        Sys.UI.DomElement.addCssClass(control, g_disabledClass);
    else {
        Sys.UI.DomElement.removeCssClass(control.parentNode, g_disabledClass);
        control.parentNode.disabled = flag
    }
}
function GetBaseFieldId(obj) {
    if (obj != null && obj != undefined) {
        for (var id = GetFieldId(obj), parts = id.split("."), expr = new String, p = 0; p < parts.length - 1; p += 2)
            expr += parts[p] + "/";
        expr += parts[parts.length - 1];
        return expr
    }
}
function GetFieldName(obj) {
    return GetFieldName(obj, "/")
}
function GetFieldName(obj, splitStr) {
    var id = obj.id;
    if (id) {
        var parts = id.split(splitStr);
        return parts[parts.length - 1]
    } else {
        id = new String(obj.getAttribute("id"));
        var parts = id.split(splitStr);
        return parts[parts.length - 1]
    }
}
function ClearOptions(obj) {
    if (obj != null) {
        var coll = obj.options;
        while (obj.options.length > 0)
            coll.remove(obj.options.length - 1);
        for (var optGroups = obj.getElementsByTagName("optgroup"), i = optGroups.length - 1; i >= 0; i--)
            obj.removeChild(optGroups[i])
    }
}
function CreateOptionElement(value, text) {
    var e = document.createElement("OPTION");
    e.value = value;
    e.text = text;
    return e
}
function CreateOptionGroup(value) {
    var e = document.createElement("OPTGROUP");
    e.label = value;
    return e
}
function FillOptions(textBox, optionNodes, valueNode) {
    var obj = textBox
      , valuenodefound = false;
    ClearOptions(obj);
    if (valueNode != null && GetNodeTextFromNode(valueNode) == "") {
        var blank = CreateOptionElement("", "");
        obj.options.add(blank, 0)
    }
    for (var i = 0; i < optionNodes.length; ++i) {
        var o = optionNodes[i]
          , value = o.getAttribute("v")
          , disp = o.getAttribute("d")
          , e = CreateOptionElement(value, disp);
        obj.options.add(e);
        if (GetNodeTextFromNode(valueNode) == value)
            valuenodefound = true
    }
    if (g_updatechildFlag == "d")
        if (valuenodefound == false && obj.disabled == false) {
            obj.value = "";
            FldOnChange(obj)
        }
}
function FillTabletOptions(textBox, optionNodes, valueNode) {
    var obj = textBox
      , valuenodefound = false;
    ClearOptions(obj);
    if (valueNode != null && GetNodeTextFromNode(valueNode) == "") {
        var blank = CreateOptionElement("", "");
        obj.options.add(blank, 0)
    }
    for (var oG = null, oE = null, owner = obj, i = 0; i < optionNodes.length; ++i) {
        var o = optionNodes[i]
          , value = o.getAttribute("v")
          , disp = o.getAttribute("d");
        if (value.endsWith("|optgroupempty")) {
            oG = CreateOptionGroup(value.substring(0, value.length - 14));
            obj.appendChild(oG)
        }
        if (value.endsWith("|optgroup")) {
            if (owner != obj) {
                obj.appendChild(owner);
                owner = obj
            }
            oG = CreateOptionGroup(value.substring(0, value.length - 9));
            owner = oG
        }
        if (value.indexOf("|", 0) == -1) {
            oE = CreateOptionElement(value, disp);
            owner.appendChild(oE)
        }
        if (GetNodeTextFromNode(valueNode) == value)
            valuenodefound = true
    }
    owner != obj && obj.appendChild(owner);
    if (g_updatechildFlag == "d")
        if (valuenodefound == false && obj.disabled == false) {
            obj.value = "";
            FldOnChange(obj)
        }
}
function FillDependentOptions(textBox, filterDataIsland, currentXPath, master, dependent) {
    if (textBox == null)
        return;
    var obj = textBox
      , currentValue = obj.value
      , oldValueIndex = 0;
    currentXPath = currentXPath + "/option";
    var optionNodes = filterDataIsland.selectNodes(currentXPath);
    ClearOptions(obj);
    if (optionNodes.length == 0) {
        var f = CreateOptionElement("", "");
        obj.options.add(f)
    }
    for (var validValue = false, i = 0; i < optionNodes.length; ++i) {
        var o = optionNodes[i]
          , value = o.getAttribute("value");
        if (value == currentValue) {
            validValue = true;
            oldValueIndex = i
        }
        for (var disp = o.getAttribute("text"), found = false, j = 0; j < obj.options.length; ++j)
            if (obj.options[j].value == value)
                found = true;
        if (!found) {
            if (value == null)
                value = "";
            if (disp == null)
                disp = "";
            var e = CreateOptionElement(value, disp);
            obj.options.add(e)
        }
    }
    obj.selectedIndex = -1;
    if (validValue) {
        obj.value = currentValue;
        obj.selectedIndex = oldValueIndex
    } else
        obj.selectedIndex = 0;
    currentXPath = currentXPath.substr(0, currentXPath.length - 7);
    currentXPath = currentXPath + "[@name='" + obj.name.split(".")[2] + "']/option[@value='" + obj.value + "']/options";
    if (obj.value != "") {
        optionNodes = filterDataIsland.selectNodes(currentXPath);
        if (optionNodes.length > 0) {
            var dependentFieldId = ParseGroup(obj.id) + "." + GetEntityIndices(obj.id) + "." + optionNodes[0].getAttribute("name")
              , masterNodes = GetMasterNode(optionNodes[0].getAttribute("name"));
            if (masterNodes != null && masterNodes.length > 0)
                var master = masterNodes[0].getAttribute("master")
                  , dependentnode = masterNodes[0].getAttribute("dependent");
            FillDependentOptions(GetObj(dependentFieldId), filterDataIsland, currentXPath, master, dependentnode)
        }
    } else if (dependent != null) {
        var masterNodes = GetMasterNode(dependent)
          , dependentFieldId = ParseGroup(obj.id) + "." + GetEntityIndices(obj.id) + "." + dependent;
        currentXPath = currentXPath + "[@name='" + dependent + "']";
        if (masterNodes != null && masterNodes.length > 0) {
            var dataIslandFilter = masterNodes[0].getAttribute("DataIslandFilter")
              , master = masterNodes[0].getAttribute("master")
              , dependentnode = masterNodes[0].getAttribute("dependent");
            FillDependentOptions(GetObj(dependentFieldId), filterDataIsland, currentXPath, master, dependentnode)
        } else
            FillDependentOptions(GetObj(dependentFieldId), filterDataIsland, currentXPath)
    }
}
function GetMasterNode(fieldname) {
    var masterXpath = "//f[@id='VEH/" + fieldname + "' and f]"
      , doc = IsLegacyIE() ? document.getElementById("coveragesExtractFilter") : LoadXMLDoc(document.getElementById("coveragesExtractFilter").textContent)
      , masterNodes = doc.selectNodes(masterXpath);
    return masterNodes
}
function GetSelectListIndex(selCtrl, lookUpText) {
    if (selCtrl.options.length <= 0)
        return -1;
    for (var i = 0; i < selCtrl.options.length; i++)
        if (selCtrl.options[i].text == lookUpText)
            return i;
    return -1
}
function FldOnChange(obj, updateDependencies) {
    if (!InvalidCharacter(obj)) {
        var fieldId = GetFieldId(obj);
        SynchronizeFields(obj, fieldId);
        var fieldChIdx = Array.indexOf(g_changes, fieldId);
        if (fieldChIdx !== -1)
            g_changes[fieldChIdx + 1] = obj.value;
        else {
            g_changes.push(fieldId);
            g_changes.push(obj.value)
        }
        updateDependencies && UpdateDependencies(obj)
    } else {
        StopPropagationAndPreventDefault();
        obj.select()
    }
}
function SynchronizeFields(obj, fieldId) {
    for (var prefixes = GetControlPrefixes(), i = 0; i < prefixes.length; i++) {
        var controlId = GetUniqueId(prefixes[i], fieldId)
          , control = GetObj(controlId);
        control != null && control != obj && SetFieldValue(control, GetFieldInternalValue(obj), GetFieldDisplayedValue(obj))
    }
}
function InvalidCharacter(currentField) {
    if (currentField.type == "text" || currentField.type == "textarea")
        if (!g_regExpValid.test(currentField.value)) {
            var fieldCaption = GetFieldCaption(currentField)
              , semicolonPos = fieldCaption.search(":");
            if (semicolonPos != -1)
                fieldCaption = fieldCaption.substr(0, semicolonPos);
            if (fieldCaption == currentField.value || fieldCaption == "")
                alert("Invalid character in field: " + currentField.value);
            else
                alert("Invalid character in the " + fieldCaption + " field: " + currentField.value);
            return true
        }
    return false
}
function GetFieldCaption(obj) {
    if (obj != null) {
        var fieldName = obj.name;
        if (fieldName != null && fieldName != "") {
            var labelNodeID = ""
              , parsedNameObj = fieldName.split(".");
            if (parsedNameObj != null && parsedNameObj.length > 0)
                labelNodeID = parsedNameObj[parsedNameObj.length - 1] + "_Label";
            if (labelNodeID != "") {
                var labelNode = GetObj(labelNodeID);
                if (labelNode != null)
                    return labelNode.innerText
            }
        }
    }
    return ""
}
function DebugRequest(changes, dependentFields) {
    if (!GetObj("rqDebug"))
        return;
    for (var s = new String, d = 0; d < dependentFields.length; ++d) {
        s += dependentFields[d];
        s += "!"
    }
    s += "!";
    for (var c = 0; c < changes.length; ++c)
        s += changes[c];
    Debug(s, "rqDebug")
}
function Debug(msg, objId) {
    var obj = GetObj(objId);
    if (obj != null)
        obj.innerText = msg
}
function CleanupApplication(closeType, saveData) {
    window.setTimeout("AsyncCleanupApplication('" + closeType + "','" + saveData + "')", 500)
}
function AsyncCleanupApplication(closeType, saveData) {
    if (historyChanged)
        return;
    var applicationIndex = GetQueryStringArgs().applicationContextIndex
      , pageFocusFld = GetPageFocusFld();
    (saveData == null || saveData) && FlushFieldInfoChanges(applicationIndex, pageFocusFld);
    var syncId = GetqueryStringValue("syncId")
      , cleanUpResult = SynchronousCall("CleanupApplication", '{"applicationContextIndex":"' + applicationIndex + '","closeType":"' + closeType + '","pageFocusFld":"' + pageFocusFld + '","syncId":"' + syncId + '"}', "Error occured while saving the quote.");
    OnCleanupComplete(cleanUpResult)
}
function BuildJSONArray(jsArray) {
    var result = "[";
    if (jsArray.length > 0) {
        result = result + '"' + jsArray[0] + '"';
        for (var i = 1; i < jsArray.length; i++)
            if (jsArray[i] != null)
                result = result + ',"' + jsArray[i] + '"'
    }
    result = result + "]";
    return result
}
function SynchronousCall(webMethod, arguments, defaultReturnText) {
    var xmlhttp = null;
    xmlhttp = CreateXMLHttpRequest();
    var url = GetFieldInfoService() + webMethod;
    xmlhttp.open("POST", url, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xmlhttp.send(arguments);
    if (xmlhttp.status == 200) {
        var responseText = xmlhttp.responseText;
        if (responseText == "SessionExpired") {
            window.location = "SessionExpired.htm";
            return ""
        } else {
            var result = eval("(" + responseText + ")");
            return result.d
        }
    }
    return defaultReturnText
}
function CreateXMLHttpRequest() {
    try {
        return new XMLHttpRequest
    } catch (e) {}
    try {
        return new ActiveXObject("Msxml2.XMLHTTP")
    } catch (e) {}
    try {
        return new ActiveXObject("Microsoft.XMLHTTP")
    } catch (e) {}
    return null
}
function OnCleanupComplete(result) {
    if (result == "SessionExpired")
        window.location = "SessionExpired.htm";
    else {
        result != "" && alert(result);
        window.onunload = null;
        window.opener = null;
        if (g_closeWindow)
            window.close();
        else
            g_closeWindow = true
    }
}
function OnFlushComplete(result) {
    if (result == "SessionExpired")
        window.location = "SessionExpired.htm"
}
function FlushFieldInfoChanges(applicationIndex, lastFieldFocusedFld) {
    if (lastFieldFocusedFld.length > 0) {
        var lastFieldFocusObj = GetObj(lastFieldFocusedFld);
        lastFieldFocusObj && FldOnChange(lastFieldFocusObj, false)
    }
    if (g_changes.length > 0) {
        var changesJSON = BuildJSONArray(g_changes)
          , fieldNamesJSON = BuildJSONArray(g_dependantFields)
          , syncId = GetqueryStringValue("syncId")
          , flushResult = SynchronousCall("GetInfo", '{"changes":' + changesJSON + ',"fieldNames":' + fieldNamesJSON + ',"applicationContextIndex":"' + applicationIndex + '","syncId":"' + syncId + '"}', "Error in Flush");
        OnFlushComplete(flushResult)
    }
}
function ShouldAddDependentFields(masterNode, changedObj) {
    var rv = true
      , cond = GetAncestor(masterNode, "cond");
    if (cond != null) {
        var condFunc = cond.getAttribute("func");
        if (eval("typeof(" + condFunc + ")") == "function")
            eval("rv = " + condFunc + "(changedObj)")
    }
    return rv
}
function GetAncestor(node, ancestorNodeName) {
    var ancestor = node.parentNode;
    while (ancestor != null) {
        if (ancestor.nodeName == ancestorNodeName)
            break;
        ancestor = ancestor.parentNode
    }
    return ancestor
}
function IsSelectListVehMake(changedObj) {
    var changedFieldId = changedObj.id
      , pos = changedFieldId.lastIndexOf(".")
      , vehEntity = changedFieldId.substring(0, pos + 1)
      , make = GetObj(vehEntity + "veh_make");
    if (make != null && make.tagName == "SELECT")
        return true;
    return false
}
function RegisterControlPrefix(prefix) {
    !IsValueInArray(g_controlPrefixes, prefix) && g_controlPrefixes.push(prefix)
}
function GetControlPrefixes() {
    return g_controlPrefixes
}
var g_childrenToValidate = ["veh_make"], g_childOptionNodes, g_childObject, g_valueNode, g_validationField = "";
function ValidateOptions(obj, optionNodes, valueNode) {
    for (var i = 0; i < g_childrenToValidate.length; i++) {
        var objID = obj.id;
        if (objID.indexOf(g_childrenToValidate[i]) >= 0) {
            g_validationField = g_childrenToValidate[i];
            g_childOptionNodes = optionNodes;
            g_childObject = obj;
            g_valueNode = valueNode;
            CallValidationFunctionIfExists()
        }
    }
}
function CallValidationFunctionIfExists() {
    var functionName = "ValidationRule_" + g_validationField;
    if (eval("typeof(" + functionName + ")") == "function")
        eval(functionName + "()")
}
function ValidationRule_veh_make() {
    var objID = g_childObject.id, nameArray = g_childObject.name.split("."), yearField, prodField;
    if (nameArray != null && nameArray.length > 0) {
        yearField = GetObj("VEH." + nameArray[1] + ".veh_mdl_yr");
        if (yearField != null && yearField.value != "")
            if ((prodField = GetObj("VEH." + nameArray[1] + ".veh_typ_cd")) != null) {
                if (GetObj("prod_cd").value != "MC") {
                    if (Number(yearField.value) < 1981 || isNaN(Number(yearField.value)) || g_childOptionNodes.length == 0) {
                        alert("Invalid year selected.");
                        yearField.focus()
                    }
                } else if (Number(yearField.value) < 1905 || isNaN(Number(yearField.value)) || g_childOptionNodes.length == 0) {
                    yearField.value = "";
                    yearField.focus()
                }
            } else if (Number(yearField.value) < 1900 || isNaN(Number(yearField.value))) {
                yearField.value = "";
                yearField.focus()
            }
    }
}
function GetObjValue(id) {
    return GetFieldValue(GetObj(id))
}
function GetFieldValue(obj) {
    var value = "";
    if (obj)
        switch (obj.tagName) {
        case "P":
            value = obj.innerText;
            break;
        case "IMG":
            value = obj.src;
            break;
        default:
            value = obj.value
        }
    return value
}
function GetFieldDisplayedValue(obj) {
    var value = "";
    if (obj)
        switch (obj.tagName) {
        case "P":
            value = obj.innerText;
            break;
        case "SELECT":
            if (obj.selectedIndex != -1)
                value = obj.options[obj.selectedIndex].text;
            break;
        case "IMG":
            value = obj.src;
            break;
        default:
            value = obj.value
        }
    return value
}
function GetFieldInternalValue(obj) {
    var value = "";
    if (obj)
        value = obj.value;
    return value
}
function SetFieldValue(obj, value, externalValue) {
    if (externalValue == null)
        externalValue = value;
    switch (obj.tagName) {
    case "A":
        obj.innerHTML = externalValue;
        break;
    case "IMG":
        obj.src = externalValue;
        break;
    case "SPAN":
        obj.innerText = value;
        break;
    case "P":
        obj.value = value;
        obj.innerText = externalValue;
        if (obj.attributes["BoldWhenValueIs"]) {
            var boldValue = obj.attributes["BoldWhenValueIs"].value;
            if (obj.value == boldValue)
                Sys.UI.DomElement.addCssClass(obj, "bold");
            else
                Sys.UI.DomElement.removeCssClass(obj, "bold")
        }
        break;
    case "SELECT":
        var listBox = obj;
        if (listBox.length > 0)
            if (listBox.length == 1 && !IsEmpty(listBox[0].text) || listBox.length > 1)
                listBox.value = value;
        break;
    default:
        var valueText = value;
        if (obj.attributes["mask"]) {
            var temp = GetEmptyMask(obj);
            if (temp != "" && valueText == "")
                valueText = temp
        }
        obj.value = valueText;
        if (IsRadioButton(obj)) {
            var radioColl = GetRadioCollection(obj);
            setRadioValue(radioColl, valueText)
        }
    }
}
function IsArray(obj) {
    if (obj != null && typeof obj.tagName == "undefined")
        return true;
    return false
}
function DumpDOM() {
    var fileName = "d:\\cssdrivers.htm"
      , fso = new ActiveXObject("Scripting.FileSystemObject")
      , fileHandle = fso.CreateTextFile(fileName, true)
      , str = document.documentElement.outerHTML;
    fileHandle.WriteLine(str);
    fileHandle.Close();
    alert("File has been saved: " + fileName)
}
function GetField(group, index, fieldId) {
    var id = group + "." + index + "." + fieldId;
    return GetObj(id)
}
function SetFieldDisabled(fieldobject) {
    if (fieldobject != null || fieldobject != "undefined") {
        fieldobject.disabled = true;
        fieldobject.style.backgroundColor = "#e4e4e4"
    }
}
function SetFieldEnabled(fieldobject) {
    if (fieldobject != null || fieldobject != "undefined") {
        fieldobject.disabled = false;
        fieldobject.style.backgroundColor = ""
    }
}
function CallAjaxMaskedEdit(id, ClearMaskOnLostFocus, Mask, MaskType, DisplayMoney, InputDirection) {
    var meeId = id + "-mee";
    !$find(meeId) && $get(id) != null && $create(AjaxControlToolkit.MaskedEditBehavior, {
        id: meeId,
        AutoComplete: false,
        CultureDateFormat: "MDY",
        CultureName: "en-US",
        CultureTimePlaceholder: ":",
        CultureAMPMPlaceholder: "AM;PM",
        AcceptAMPM: true,
        ClearMaskOnLostFocus: ClearMaskOnLostFocus,
        CultureDatePlaceholder: "/",
        Mask: Mask,
        MaskType: MaskType,
        CultureDecimalPlaceholder: ".",
        CultureThousandsPlaceholder: ",",
        CultureCurrencySymbolPlaceholder: "$",
        InputDirection: InputDirection,
        DisplayMoney: DisplayMoney,
        Filtered: "*"
    }, null, null, $get(id))
}
function CallAjaxFilteredTextBox(id, validChars) {
    var meeId = id + "-mee";
    !$find(meeId) && $get(id) != null && $create(AjaxControlToolkit.FilteredTextBoxBehavior, {
        ValidChars: validChars,
        id: meeId
    }, null, null, $get(id))
}
function SetFocus(id) {
    var setFocusObject = GetClientControl(id);
    setFocusObject != null && setFocusObject.focus()
}
function EmptyDocumentSelection() {
    document.selection.empty()
}
function IdentifyPositionedAncestor(obj) {
    var parent = obj.parentElement;
    if (parent == document.documentElement || parent.style.position == "relative" || parent.style.position == "absolute")
        return parent;
    else
        return IdentifyPositionedAncestor(parent)
}
function IsEmpty(StrToCheck) {
    var regEx = new String(" ")
      , regExpression = new RegExp(regEx,"g");
    StrToCheck = StrToCheck.replace(regExpression, "");
    if (StrToCheck.length == 0)
        return true;
    else
        return false
}
function ApplyDateMask(obj) {
    if (!obj.attributes["mask"] || obj.value == "" || obj.value == "__/__/____")
        return;
    if (obj.getAttribute("mask") == "99/99/9999")
        if (obj.value.substr(0, 10) == "11/11/1111" || obj.value.substr(0, 9) == "11/111111" || obj.value.substr(0, 8) == "11111111")
            obj.value = "11/11/1911";
        else
            obj.value = FormatDate("02.02.04", obj.getAttribute("mask"), obj.value, 4)
}
function GetEmptyMask(obj) {
    return "" + obj.getAttribute("emptyMask")
}
function Format(spec, mask, val) {
    var external = new String("")
      , pad = new Array(10)
      , fldWidth = new Array(10)
      , expectedClumps = ParseFormatSpec(spec, pad, fldWidth)
      , clumps = val.split(/[\.,()\-/:~`!@#$%^&_=+\[\]{}\\|;'"<>? ]/);
    if (clumps.length == 0)
        return "";
    for (var c = 0; c < clumps.length; ++c) {
        var size = clumps[c].length;
        if (size > fldWidth[c]) {
            if (clumps.length < expectedClumps) {
                for (var split = clumps[c].substr(fldWidth[c]), c1 = clumps.length; c1 > c + 1; --c1)
                    clumps[c1] = clumps[c1 - 1];
                clumps[c + 1] = split
            }
            clumps[c] = clumps[c].substr(0, fldWidth[c])
        }
        var fill = fldWidth[c] - size;
        if (fill > 0)
            if (pad[c] == " ")
                for (var c1 = 0; c1 < fill; ++c1)
                    clumps[c] += " ";
            else
                for (var c1 = 0; c1 < fill; ++c1)
                    clumps[c] = pad[c] + clumps[c];
        external += clumps[c]
    }
    var clumpCount = clumps.length;
    while (clumpCount < expectedClumps) {
        for (var p = pad[clumpCount] == 0 ? " " : pad[clumpCount], c1 = 0; c1 < fldWidth[clumpCount]; ++c1)
            clumps[c] += p;
        ++clumpCount
    }
    for (var e = 0, formatted = new String(""), maskChars = new String("~`!@#$%^&()-_=+[]{}\\|;:'\"<>,./? "), m = 0; m < mask.length; ++m)
        if (maskChars.indexOf(mask.charAt(m)) >= 0)
            formatted += mask.charAt(m);
        else {
            formatted += external.charAt(e);
            ++e
        }
    return formatted
}
function FormatDate(spec, mask, val, additionalYears) {
    var formatted = Format(spec, mask, val)
      , parts = formatted.split("/");
    if (parts.length == 3 && parts[2].substr(0, 2) == "00") {
        var year = parts[2].substr(2);
        return new String(parts[0] + "/" + parts[1] + "/" + GetCentury(year, additionalYears) + parts[2].substr(2))
    }
    return formatted
}
function GetCentury(year, additionalYears) {
    var today = new Date
      , adjYear = today.getFullYear() - 2e3 + additionalYears;
    if (year < adjYear)
        return new String("20");
    else
        return new String("19")
}
function ParseFormatSpec(spec, pad, fldWidth) {
    for (var specs = spec.split("."), s = 0; s < specs.length; ++s) {
        var piece = specs[s];
        if (piece.charAt(0) < "1" || piece.charAt(0) > "9") {
            pad[s] = piece.charAt(0);
            fldWidth[s] = piece.substr(1)
        } else {
            pad[s] = " ";
            fldWidth[s] = piece
        }
    }
    return specs.length
}
function ModifyTimeClearFocus(obj) {
    var objId = obj.getAttribute("id"), mee, objValue;
    if (objId) {
        mee = $find(objId + "-mee");
        if (mee && obj.masktype == AjaxControlToolkit.MaskedEditType.Time) {
            objValue = obj.value;
            if (objValue.indexOf("_") != -1)
                mee.set_ClearMaskOnLostFocus(false);
            else
                mee.set_ClearMaskOnLostFocus(true)
        }
    }
}
function ConfirmEntityDelete(entityName, index, deleteFunction, preDeleteValidationMethod) {
    if (preDeleteValidationMethod) {
        var funcName = preDeleteValidationMethod + "(" + index + ")";
        if (eval(funcName) == false)
            return false
    }
    var msg = "Are you sure you want to delete " + entityName + " #" + (index + 1) + "?";
    if (UbiTrialVehicle(index) == true)
        msg = "If you Remove this vehicle, we cannot apply the Snapshot discount earned.\nIf the customer has replaced this vehicle with another, then click Cancel and edit the vehicle information.";
    if (confirm(msg) == true) {
        ClearLastFocusField();
        var functionName = deleteFunction.substring(0, deleteFunction.indexOf("("));
        if (eval("typeof(" + functionName + ")") == "function")
            eval(deleteFunction);
        if (isVehiclePage(g_currentPage) && g_vehCount > 1)
            --g_vehCount;
        if (isDriverPage(g_currentPage) && g_drvrCount > 1)
            --g_drvrCount
    }
}
function isVehiclePage(g_currentPage) {
    return g_currentPage == "C2VehicleSummary" || g_currentPage == "Vehicles" || g_currentPage == "Boataqar" || g_currentPage == "Motorcycleaqar" || g_currentPage == "RecVehicle" || g_currentPage == "MobileHome"
}
function isDriverPage(g_currentPage) {
    return g_currentPage == "C2DriverSummary" || g_currentPage == "Drivers"
}
function UbiTrialVehicle(index) {
    var vehUbiDvcId = GetObj("VEH." + index + ".veh_ubi_dvc_id");
    return vehUbiDvcId != null && vehUbiDvcId.value != "" && vehUbiDvcId.value != "0"
}
function GetTotalElementBounds(element) {
    if (!element)
        return;
    var bounds = $common.getBounds(element)
      , border = $common.getBorderBox(element)
      , margin = $common.getMarginBox(element)
      , width = bounds.width + border.horizontal + margin.horizontal
      , height = bounds.height + border.vertical + margin.vertical
      , x = bounds.x - border.left - margin.left
      , y = bounds.y - border.top - margin.top;
    return new Sys.UI.Bounds(x,y,width,height)
}
function GetContentBounds(element) {
    if (!element)
        return;
    var bounds = $common.getBounds(element)
      , padding = $common.getPaddingBox(element)
      , width = bounds.width - padding.horizontal
      , height = bounds.height - padding.vertical
      , x = bounds.x + padding.left
      , y = bounds.y + padding.top;
    return new Sys.UI.Bounds(x,y,width,height)
}
function OpenDialogOnFocus(callFunction) {
    var bShowPopup = false
      , functionName = callFunction.substring(0, callFunction.indexOf("("));
    if (eval("typeof(" + functionName + ")") == "function")
        eval("bShowPopup = " + callFunction);
    return bShowPopup
}
function TextDialogKeyPress(obj, dialogID) {
    if (eval("typeof(TextDialogKeyPress" + g_currentPage + ")") == "function")
        eval("TextDialogKeyPress" + g_currentPage + "('" + obj.id + "','" + dialogID + "')");
    else {
        if (event.keyCode == 9 || event.keyCode == 16 || event.keyCode == 17 || event.keyCode == 18 || event.keyCode == 27)
            return;
        PreventDefault();
        obj.value = g_HoldValue;
        ShowDialog(obj, dialogID)
    }
}
function UpdateCheckBoxChanged(obj) {
    var hiddenField = GetObj(obj.id.replace("_displayCheckBox", ""));
    if (hiddenField)
        if (obj.checked)
            hiddenField.value = "Y";
        else if (obj.attributes["SetBlank"] && obj.attributes["SetBlank"].value == "true")
            hiddenField.value = "";
        else
            hiddenField.value = "N"
}
function HandleMultiLine() {
    var keyCd = window.event.keyCode;
    if (keyCd == 13) {
        StopPropagationAndPreventDefault();
        return false
    } else
        return true
}
function SetFieldClear(FieldObject) {
    if (FieldObject.tagName == "INPUT") {
        if (FieldObject.type == "checkbox") {
            FieldObject.checked = false;
            FldOnChange(FieldObject);
            UpdateCheckBoxChanged(FieldObject)
        } else if (FieldObject.type == "text") {
            var emptyValue = "";
            if (FieldObject.getAttribute("mask") != null)
                emptyValue = GetEmptyMask(FieldObject);
            FieldObject.value = emptyValue;
            FldOnChange(FieldObject)
        } else if (IsRadioButton(FieldObject)) {
            var valueText = ""
              , radioColl = GetRadioCollection(FieldObject);
            setRadioValue(radioColl, valueText)
        }
    } else if (FieldObject.tagName == "SELECT") {
        if (FieldObject.options[0] != null && FieldObject.options[0].text != "") {
            var e = document.createElement("OPTION");
            e.text = "";
            e.value = "";
            FieldObject.options.add(e, 0)
        }
        FieldObject.selectedIndex = 0;
        FldOnChange(FieldObject)
    }
}
function HandleRadioKeyDown() {
    if (EventObj().srcElement.keyCode == 13)
        return false
}
function UpdateHiddenField(fieldID) {
    var obj = GetObj(fieldID)
      , radioGroup = GetDocumentAllObjects(EventObj().srcElement.name);
    for (i = 0; i < radioGroup.length; i++)
        if (radioGroup[i].checked) {
            obj.value = radioGroup[i].value;
            break
        }
}
var g_mouseClicked = 0
  , g_dialogButton = ""
  , g_changedDialogId = ""
  , g_dialogIdList = [];
function IsDialogActive() {
    if (g_dialogIdList.length > 0)
        return true;
    return false
}
function GetActiveDialog() {
    var dialogId = "";
    if (IsDialogActive())
        dialogId = g_dialogIdList[g_dialogIdList.length - 1];
    return dialogId
}
function PrepareDialogForDisplay() {
    if (getIEVersionNumber() != 6) {
        GetObj("selectProtect").style.zIndex = 10002;
        GetObj("expandList~common").style.zIndex = 10002;
        GetObj("selectProtectCloseHdlr").style.zIndex = 10002;
        GetObj("selectProtect").style.display = "none"
    }
}
function OnMouseOutDialogPanel() {
    if (getIEVersionNumber() != 6) {
        var hiddenSelect = GetObj("selectProtect").hiddenSelect;
        hiddenSelect && PlaceSelectProtect(GetObj(hiddenSelect));
        GetObj("selectProtect").style.display = ""
    }
}
function OnMouseOverDialogPanel() {
    if (getIEVersionNumber() == 6)
        HideSelectListControls();
    else {
        var srcObj = GetObj("selectProtect");
        if (srcObj)
            srcObj.style.display = "none"
    }
}
function SetRenderDialogFieldValue() {
    SetHiddenRenderDialogVariable("Y")
}
function SetHiddenRenderDialogVariable(hiddenfieldValue) {
    var dialogId = GetActiveDialog()
      , renderDialogId = GetHiddenVariable("renderDialog" + dialogId);
    if (GetObj(renderDialogId) != null)
        GetObj(renderDialogId).value = hiddenfieldValue
}
function RegisterShownDialog(dialogId) {
    var modalPopupBehaviorId = GetHiddenVariable("modalPopupBehaviorId" + dialogId)
      , behavior = $find(modalPopupBehaviorId)
      , showFunction = "Shown" + dialogId;
    behavior.remove_shown(eval(showFunction));
    behavior.add_shown(eval(showFunction))
}
function ShowDialogWithEntity(srcElement, dialogId, forceShow, entity, mode) {
    var hdnDialogDispButtonId = GetHiddenVariable("hdnDialogDispButtonId" + dialogId)
      , modalPopupBehaviorId = GetHiddenVariable("modalPopupBehaviorId" + dialogId)
      , dialogPathId = GetHiddenVariable("dialogPathId" + dialogId)
      , dialogModeId = GetHiddenVariable("dialogModeId" + dialogId)
      , btnShowDialogId = GetHiddenVariable("btnShowDialogId" + dialogId)
      , openAction = GetHiddenVariable("openAction" + dialogId);
    g_dialogButton = "";
    if (srcElement)
        g_dialogButton = srcElement.id;
    if (forceShow || !HasDialogBeenDisplayed(hdnDialogDispButtonId, dialogId, entity)) {
        PrepareDialogForDisplay();
        AddToDisplayedDialogs(hdnDialogDispButtonId, dialogId, entity);
        if (openAction == "client") {
            RegisterShownDialog(dialogId);
            var behavior = $find(modalPopupBehaviorId);
            behavior.show()
        } else {
            Sys.WebForms.PageRequestManager.getInstance().add_endRequest(eval("RegisterShown" + dialogId));
            GetObj(dialogPathId).value = entity;
            GetObj(dialogModeId).value = mode;
            GetObj(btnShowDialogId).click()
        }
    }
    g_EntityOverride = ""
}
function ShowDialog(srcElement, dialogId, forceShow) {
    return ShowDialogWithEntity(srcElement, dialogId, forceShow, GetEntity())
}
function OnFocusShowDialog(srcElement, dialogId, fieldId) {
    if (g_mouseClicked == 1) {
        g_mouseClicked = 0;
        return
    }
    var functionName = "GetButtonAutoFireConditionList" + dialogId
      , buttonAutoFireConditionList = "";
    if (eval("typeof(" + functionName + ")") == "function")
        buttonAutoFireConditionList = eval(functionName + "()");
    var value = GetObjValue(fieldId)
      , buttonAutoFireEnabled = IsValueInList(buttonAutoFireConditionList, value);
    buttonAutoFireEnabled && ShowDialog(srcElement, dialogId, false)
}
function HasDialogBeenDisplayed(hdnFieldId, dialogId, entity) {
    var hasBeenDisplayed = false
      , displayedDialogArray = GetObj(hdnFieldId).value.split(",")
      , entityIndex = GetEntityIndex(entity) == "" ? 0 : GetEntityIndex(entity);
    if (displayedDialogArray[entityIndex] == "Y")
        hasBeenDisplayed = true;
    return hasBeenDisplayed
}
function AddToDisplayedDialogs(hdnFieldId, dialogId, entity) {
    var hdnField = GetObj(hdnFieldId)
      , displayedDialogArray = hdnField.value.split(",")
      , entityIndex = GetEntityIndex(entity) == "" ? 0 : GetEntityIndex(entity);
    displayedDialogArray[entityIndex] = "Y";
    hdnField.value = displayedDialogArray.join(",");
    Array.indexOf(g_dialogIdList, dialogId) == -1 && g_dialogIdList.push(dialogId)
}
function GetDialogPath(dialogId, entity) {
    var dialogPath = dialogId;
    if (entity != "")
        dialogPath += "." + entity;
    return dialogPath
}
function IsValueInList(list, value) {
    if (list != null && list != "" && (value != null && value != "")) {
        var parts = list.split(",");
        return IsValueInArray(parts, value)
    }
    return false
}
function IsValueInArray(array, value) {
    if (array != null)
        for (var i = 0; i < array.length; i++)
            if (array[i] == value)
                return true;
    return false
}
function DialogOnCancel(dialogId, cancelbutton) {
    var dialogPreCancel = "DialogPreCancel" + dialogId;
    CallIfFunctionExists(dialogPreCancel);
    EnableAll();
    CloseDialog(dialogId);
    cancelbutton != null && GetObj(cancelbutton).click()
}
function CloseDialog(dialogId) {
    SetHiddenRenderDialogVariable("N");
    var dialogModeId = GetHiddenVariable("dialogModeId" + dialogId);
    if (GetObj(dialogModeId) != null)
        GetObj(dialogModeId).value = "";
    var indexOfCurrentDialog = Array.indexOf(g_dialogIdList, dialogId);
    indexOfCurrentDialog != -1 && g_dialogIdList.splice(indexOfCurrentDialog, 1);
    if (g_dialogButton != "")
        g_lastFocusFieldId = g_dialogButton;
    g_dialogButton = "";
    if (getIEVersionNumber() != 6 && !IsDialogActive()) {
        CallIfFunctionExists("CloseDialog" + dialogId);
        HideSelectListControls();
        GetObj("selectProtect").style.zIndex = 9998;
        GetObj("selectProtectCloseHdlr").style.zIndex = 9999;
        GetObj("expandList~common").style.zIndex = 1e4
    }
    !IsDialogActive() && RestoreLastFocusField()
}
function DialogOnContinue(dialogId) {
    var dialogPreContinue = "DialogPreContinue" + dialogId;
    CallIfFunctionExists(dialogPreContinue);
    var functionName = "DialogOnContinue" + dialogId;
    CallIfFunctionExists(functionName)
}
function GetHiddenVariable(variableName) {
    var retVal = null;
    try {
        retVal = eval(variableName)
    } catch (e) {}
    return retVal
}
function DialogOnPrint(dialogId) {
    var panDialog = GetObj(GetHiddenVariable("DialogPanel" + dialogId))
      , printContent = GetObj(GetHiddenVariable("DialogContentWrapper" + dialogId))
      , windowUrl = "about:blank"
      , uniqueName = new Date
      , windowName = "Print" + uniqueName.getTime()
      , printWindow = ShowPrintWindow(panDialog, windowUrl, windowName);
    printWindow.document.write(GetHiddenVariable("DialogStyleSheet" + dialogId));
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.title = GetHiddenVariable("DialogTitle" + dialogId);
    window.setTimeout(function() {
        if (!(GetObjValue("mobiledevice_ind") == "Y")) {
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close()
        }
    }, 500)
}
function OnMouseButtonDown() {
    g_mouseClicked = 1
}
function ForceCloseDialog() {
    if (GetActiveDialog() == "PreBindingVerification")
        CallIfFunctionExists("PreBindingVerificationForceCloseDialog");
    else
        GetObj(GetHiddenVariable("OkButton" + GetActiveDialog())).click()
}
function ChangeDialog(newDialogId, closeCurrent) {
    g_changedDialogId = newDialogId;
    var postBack = GetHiddenVariable("ContinueButtonDisplay" + GetActiveDialog());
    postBack && Sys.WebForms.PageRequestManager.getInstance().add_endRequest(ShowChangedDialog);
    closeCurrent && ForceCloseDialog();
    !postBack && ShowChangedDialog()
}
function ShowChangedDialog() {
    var dialogId = g_changedDialogId;
    g_changedDialogId = "";
    Sys.WebForms.PageRequestManager.getInstance().remove_endRequest(ShowChangedDialog);
    ShowDialog(null, dialogId, true)
}
var g_HoldValue;
function OnFocusTextButtonDialog(obj) {
    g_HoldValue = obj.value
}
function ShowDialogCentered(dialogId, panDialog, dialogWrapper, innerWrapper, maxClientHeightFactor, maxClientWidthFactor) {
    var clientBounds = $common.getClientBounds()
      , maxClientWidth = clientBounds.width
      , maxClientHeight = clientBounds.height;
    maxClientWidth = maxClientWidth * maxClientWidthFactor;
    maxClientHeight = maxClientHeight * maxClientHeightFactor;
    AdjustWrapper(maxClientWidth, maxClientHeight, dialogWrapper, innerWrapper, 0, 0, true, true);
    var bounds = GetTotalElementBounds(dialogWrapper);
    panDialog.style.width = bounds.width + "px";
    IsIE6() && window.onresize();
    window.focus();
    FocusFirstControl(dialogWrapper);
    dialogWrapper.scrollTop = 0;
    dialogWrapper.scrollLeft = 0
}
function OnContinueCheck(dialogId) {
    HideSelectListControls();
    this.onmouseover = function() {}
    ;
    this.onmouseout = function() {}
    ;
    GetObj(GetHiddenVariable("ContinueButton" + dialogId)).click()
}
var g_lastFocusFieldId, g_keysWithCtrl = ["n"], g_isWindowCloseKey = false, g_startTimeCaptured = false, g_updatePanelInProcess = false, g_ConfirmParentValue = "", g_isWindowUnloadKey = false, g_insideWindowUnload = false, g_pausePositionSelectProtect = false, g_disablePageMutex = 0, g_popupBlockerUnload = false;
window.addEventListener && window.addEventListener("DOMMouseScroll", wheel, false);
window.onmousewheel = document.onmousewheel = wheel;
function SetDocumentKeyDownHandler() {
    document.onkeydown = DocumentKeyDownHandler
}
function IfFunctionExists(functionName) {
    if (eval("typeof(" + functionName + ")") == "function")
        return true;
    else
        return false
}
function SetDocumentKeyPressHandler() {
    document.onkeypress = DocumentKeyPressHandler
}
function SetDocumentKeyDownCancel() {
    document.onkeydown = CancelKeyDown
}
function CallIfFunctionExists(functionName) {
    if (eval("typeof(" + functionName + ")") == "function") {
        eval(functionName + "()");
        return true
    } else
        return false
}
function DocumentKeyPressHandler() {
    var obj = window.event.srcElement;
    if (window.event.keyCode == 13)
        if (IsDialogActive()) {
            if (!IsButton(obj) && !IsAnchor(obj)) {
                ForceCloseDialog();
                return false
            }
        } else if (!IsButton(obj) && !IsAnchor(obj)) {
            CloseIfSysErrMsgDisplayed();
            !ActiveElementIsSelect() && CallIfFunctionExists("NavigateToNextPage");
            return false
        }
    return true
}
function ActiveElementIsSelect() {
    return window.event.srcElement.tagName == "SELECT" || window.event.srcElement.tagName == "DIV" && window.event.srcElement.children[0].tagName == "SELECT"
}
function CloseIfSysErrMsgDisplayed() {
    var isSysErrMsgDisplayed = GetObj("isSysErrorDisplayed");
    if (isSysErrMsgDisplayed != null)
        isSysErrMsgDisplayed.value == "Y" && self.close()
}
function SetCrossSell() {
    for (var parentNodeVar, mainMenuDiv = $get("mainMenuDiv"), menus = mainMenuDiv.getElementsByTagName("A"), menusCount = menus.length, index = 0; index < menusCount; index++)
        var menu = menus[index];
    menu.className = menu.className + " itemstylecrosssell";
    parentNodeVar = menu.parentNode;
    while (parentNodeVar.tagName.toLowerCase() != "table")
        parentNodeVar = parentNodeVar.parentNode;
    parentNodeVar.className = parentNodeVar.className + " itemstylecrosssell"
}
function SbrOnKeyDown() {
    if (event.keyCode == 9)
        return false;
    else
        return true
}
function IsButton(obj) {
    if (obj && (obj.type == "image" || obj.type == "button" || obj.type == "submit"))
        return true;
    else
        return false
}
function IsAnchor(obj) {
    if (obj && obj.tagName == "A")
        return true;
    else
        return false
}
function IgnoreSpecialControlKeys(event) {
    if (event.ctrlKey)
        for (var i = 0; i < g_keysWithCtrl.length; i++)
            g_keysWithCtrl[i].toLowerCase() == String.fromCharCode(event.keyCode).toLowerCase() && StopPropagationAndPreventDefault()
}
function IdentifyWindowCloseKeys() {
    try {
        bAltKey = window.event.altKey;
        bCtrlKey = window.event.ctrlKey;
        keyCode = window.event.keyCode;
        if (bAltKey && keyCode == g_keyF4 || bCtrlKey && keyCode == g_keyW || bCtrlKey && keyCode == g_keyw || bCtrlKey && keyCode == g_keyF4)
            g_isWindowCloseKey = true;
        else
            g_isWindowCloseKey = false
    } catch (ex) {}
}
function IdentifyWindowUnloadKeys() {
    switch (window.event.keyCode) {
    case g_keyBackspace:
    case g_keyF5:
    case g_keyEnter:
        g_isWindowUnloadKey = true;
        break;
    case g_keyLeftArrow:
    case g_keyRightArrow:
        if (window.event.altKey)
            g_isWindowUnloadKey = true;
        break;
    default:
        g_isWindowUnloadKey = false
    }
}
function SetUnloadkeyCloseStatus() {
    if (g_isWindowUnloadKey == false)
        g_isWindowUnloadKey = true
}
function DocumentKeyDownHandler() {
    IgnoreSpecialControlKeys(window.event);
    g_disablePageMutex > 0 && StopPropagationAndPreventDefault();
    IdentifyWindowCloseKeys();
    IdentifyWindowUnloadKeys();
    CatchBackspaceKey()
}
function CatchBackspaceKey() {
    var obj = window.event.srcElement
      , srcType = event.srcElement.type;
    window.event.keyCode == g_keyBackspace && srcType != "text" && srcType != "textarea" && StopPropagationAndPreventDefault()
}
function IsWindowCloseClicked() {
    var returnValue = false;
    if (!g_isWindowUnloadKey && !g_insideWindowUnload)
        returnValue = true;
    if (g_isWindowCloseKey == true)
        returnValue = true;
    if (g_popupBlockerUnload == true) {
        g_popupBlockerUnload = false;
        returnValue = false
    }
    return returnValue
}
function wheel() {
    if (IsExpandListOpened()) {
        if (!HitTest())
            window.event.returnValue = false
    } else
        window.event.returnValue = true
}
function HitTest() {
    var base = GetObj("expandList~common")
      , left = parseInt(base.style.left.replace("px", ""))
      , top = parseInt(base.style.top.replace("px", ""))
      , right = left + base.offsetWidth
      , bottom = top + base.offsetHeight
      , zones = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };
    zones.top = top;
    zones.bottom = bottom;
    zones.right = right;
    zones.left = left;
    var xy = cursorPos(event);
    return pointInRect(xy, zones)
}
function cursorPos(e) {
    var e = e || window.event
      , posXY = {
        x: 0,
        y: 0
    };
    if (e.pageX || e.pageY) {
        posXY.x += e.pageX;
        posXY.y += e.pageY
    } else if (e.clientX || e.clientY) {
        posXY.x += e.clientX + document.body.scrollLeft;
        posXY.y += e.clientY + document.body.scrollTop
    }
    return posXY
}
function pointInRect(pos, rect) {
    return pos.x > rect.left && pos.x < rect.right && pos.y > rect.top && pos.y < rect.bottom
}
function HideSelectListControls() {
    if (getIEVersionNumber() == 6) {
        HideExpandListAndShrinkElement("expandList~iframe");
        HideExpandListAndShrinkElement("expandList~iframe~closehdlr");
        HideExpandListAndShrinkElement("expandList~common~iframe")
    } else {
        HideExpandListAndShrinkElement("selectProtect");
        HideExpandListAndShrinkElement("selectProtectCloseHdlr");
        HideExpandListAndShrinkElement("expandList~common")
    }
    var functionName = "OnScroll" + g_currentPage;
    CallIfFunctionExists(functionName)
}
function GetObj(id) {
    return document.getElementById(id)
}
function ResizeMainDiv() {
    ResizeMainDivHeight();
    GetObjValue("mobiledevice_ind") != "Y" && ResizeMainDivWidth(null);
    HideSelectListControls()
}
var g_menuDivId, g_bannerId;
function ResizeMainDivHeight() {
    var bodyHeight = document.documentElement.clientHeight
      , bannerHeight = 0
      , tabListHeight = 0;
    if (GetObj(g_bannerId))
        bannerHeight = GetObj(g_bannerId).clientHeight;
    if (GetObj(g_menuDivId))
        tabListHeight = GetObj(g_menuDivId).clientHeight;
    var newMainDivWrapperHeight = bodyHeight - (bannerHeight + tabListHeight + GetHeightOffset());
    if (newMainDivWrapperHeight > 0)
        GetObj("mainDivWrapper").style.height = newMainDivWrapperHeight + "px";
    else
        GetObj("mainDivWrapper").style.height = "auto"
}
function GetPageOffset() {
    return 0
}
function ResizeMainDivWidth(offset) {
    if (offset == null)
        offset = GetPageOffset();
    var mainDiv = GetObj("mainDiv")
      , innerWrapper = GetObj("mainDivSizer")
      , footerDiv = GetObj("footerDiv")
      , outerBounds = GetContentBounds(mainDiv)
      , mainDivWidth = outerBounds.width;
    mainDiv.style.width = mainDivWidth * 2 + "px";
    var innerBounds = GetContentBounds(innerWrapper);
    mainDiv.style.width = mainDivWidth + "px";
    var footerBounds = GetContentBounds(footerDiv)
      , innerWidth = innerBounds.width + offset + GetWidthOffset()
      , footerWidth = footerBounds.width
      , newWidth = footerWidth > innerWidth ? footerWidth : innerWidth;
    if (newWidth != mainDivWidth)
        mainDiv.style.width = newWidth + "px"
}
function SetMainDivWidthForAdd(groupName) {
    if (IsIE6()) {
        var objID = groupName + ".0"
          , entityWidth = GetObj(objID).offsetWidth;
        ResizeMainDivWidth(entityWidth)
    }
}
function IsIE6() {
    return navigator.appVersion.indexOf("MSIE 6", 0) > 0
}
function IsIE7() {
    return navigator.appVersion.indexOf("MSIE 7", 0) > 0
}
function IsLegacyIE() {
    return IsIE6() || IsIE7()
}
function GetWidthOffset() {
    if (IsIE6())
        return 5;
    else
        return 0
}
function GetHeightOffset() {
    if (IsIE6())
        return 4;
    else
        return 0
}
function GetEntity() {
    if (event == null)
        return "";
    var entity = ""
      , ctrl = event.srcElement;
    try {
        while (ctrl) {
            if (ctrl.attributes["entity"]) {
                entity = ctrl.getAttribute("entity");
                break
            }
            ctrl = ctrl.parentElement
        }
    } catch (e) {}
    return entity
}
function GetEntityIndex() {
    var entity = GetEntity()
      , indices = GetEntityIndices(entity)
      , index = "";
    if (indices.length > 0)
        index = indices[indices.length - 1];
    return index
}
function ParseGroup(fieldId) {
    if (fieldId) {
        var parts = fieldId.split(".");
        return parts[0]
    }
    return ""
}
function GetEntityIndices(entity) {
    var indices = [];
    if (entity != null)
        for (var parts = entity.split(new RegExp("[./]")), i = 1; i < parts.length; i += 2) {
            var index = parseInt(parts[i]);
            !isNaN(index) && indices.push(index)
        }
    return indices
}
function openSpawnWindow(_page, w, h) {
    _page = AddApplicationContextIndex(_page);
    inHouse = GetObj("_inhouseFlag");
    var winparms = "";
    if (inHouse)
        if (inHouse.value == "Y")
            winparms = "status=yes, resizable=yes, scrollbars=yes, width=" + w + ", height=" + h + ",left=" + 0 + ",top=" + 32;
        else
            winparms = "status=yes, resizable=yes, scrollbars=yes, width=" + w + ", height=" + h + ",left=" + 0 + ",top=" + 0;
    else
        winparms = "status=yes, resizable=yes, scrollbars=yes, width=" + w + ", height=" + h + ",left=" + 0 + ",top=" + 0;
    var win = window.open(_page, "_blank", winparms);
    win.focus()
}
function OpenDefaultCoverages() {
    var state = GetObj("_state").value
      , product = GetObj("_product").value;
    openSpawnWindow("page_engine.aspx?_state=" + state + "&_product=" + product + "&workflow=DefaultCoverages", 792, 528)
}
function OpenNewQuote() {
    var state = GetObj("_state").value
      , product = GetObj("_product").value
      , chkSavedQuote = "N";
    openSpawnWindow("page_engine.aspx?_state=" + state + "&_product=" + product + "&checkSavedQuote=" + chkSavedQuote, 792, 528)
}
function ShowPrintWindow(obj, url, windowName) {
    var windowOptions = "height=" + (obj.clientHeight + 5) + ",";
    windowOptions += "width=" + (obj.clientWidth + 5) + ",";
    var absPos = $common.getLocation(obj);
    windowOptions += "position:absolute,";
    windowOptions += "top=" + (absPos.y + window.screenTop) + ",";
    windowOptions += "left=" + (absPos.x + window.screenLeft) + ",";
    return window.open(url, windowName, windowOptions)
}
function ShowPopupWindow(obj, url, windowName, windowOptions) {
    obj.popupWindow = window.open(url, windowName, windowOptions);
    obj.popupWindow.focus()
}
function ShowPopupCenterWindow(obj, url, windowName, windowWidth, windowHeight, windowOptions, needApplicationContext) {
    if (needApplicationContext == null || needApplicationContext == "undefined" || needApplicationContext == true)
        url = AddApplicationContextIndex(url);
    ShowPopupWindow(obj, url, windowName, SetNewWindowOptions(obj, windowWidth, windowHeight, windowOptions), needApplicationContext)
}
function SetNewWindowOptions(obj, windowWidth, windowHeight, windowOptions) {
    var winleft = (screen.width - windowWidth - obj.offsetLeft) / 3 + window.screenLeft
      , wintop = (screen.height - windowHeight - obj.sourceIndex) / 3 + window.screenTop;
    if (winleft < 0)
        winleft = 0;
    if (wintop < 0)
        wintop = 0;
    var newWindowOptions = "height=" + windowHeight + ",";
    newWindowOptions += "width=" + windowWidth + ",";
    newWindowOptions += "top=" + wintop + ",";
    newWindowOptions += "left=" + winleft + ",";
    newWindowOptions += windowOptions;
    return newWindowOptions
}
function ShowModalPopupWindow(url, windowName, windowWidth, windowHeight, parentObjectParam) {
    url = AddApplicationContextIndex(url);
    var windowProperties = "edge: Raised; center: Yes; help: No; scroll: No; resizable: No; status: No; unadorned: Yes;";
    if (IsIE6()) {
        windowWidth += 50;
        windowHeight += 50
    }
    windowProperties += " dialogWidth: " + windowWidth + "px;";
    windowProperties += " dialogHeight: " + windowHeight + "px;";
    var parentObject = null;
    if (parentObjectParam == null) {
        parentObject = {};
        parentObject.opener = window;
        parentObject.callback = FieldInfoInProcess;
        parentObject.timeOut = GetScriptManagerTimeout()
    } else
        parentObject = parentObjectParam;
    try {
        var retval = ""
          , prntNewWindow = false;
        typeof PrintWindowNeeded == "function" && PrintWindowNeeded() == true ? (prntNewWindow = true) : (prntNewWindow = false);
        if (window.showModalDialog && !prntNewWindow && GetObjValue("mobiledevice_ind") != "Y")
            retval = window.showModalDialog(url, parentObject, windowProperties);
        else if (GetObjValue("mobiledevice_ind") == "Y" || prntNewWindow) {
            parentObject.timeOut = 6e4;
            var loadingDiv = GetObj("loadingContainer");
            if (loadingDiv != null) {
                SetLoadingTitle(loadingDiv, url);
                SetLoadingBody(loadingDiv, url);
                $("#loadingContainer").dialog({
                    autoOpen: true,
                    height: 175,
                    width: 250,
                    modal: true,
                    open: function() {
                        $(".ui-dialog-titlebar-close").hide();
                        retval = CheckFieldInfoProcess(parentObject.timeOut)
                    }
                })
            }
        }
    } catch (e) {
        (!retval || retval.closed || typeof retval.closed == "undefined") && alert("You may be receiving this message due to a pop-up blocker.  To proceed, first add ForAgentsOnly.com to your exclusion list and then retry your quote. \r\n For assistance with this, please call Progressive Agent Technical Support at 1-800-695-4050")
    }
    g_isWindowUnloadKey = true;
    return retval
}
function SetLoadingBody(obj, url) {
    if (obj) {
        var body = "Please Wait<br> Transaction Being Processed.<br><img src='images/plswait.gif'>";
        if (url.indexOf("create_forms.htm") != -1)
            body = "Please Wait<br> Creating Document(s).<br> <img src='images/plswait.gif'>";
        obj.innerHTML = body
    }
}
function SetLoadingTitle(obj, url) {
    if (obj) {
        var title = "Please Wait";
        if (url.indexOf("trxInFlight.htm") != -1)
            title = "Transaction in Process";
        obj.setAttribute("title", title)
    }
}
function CheckFieldInfoProcess(parenttimeOutVal) {
    var timeOutValueInt = parseInt(parenttimeOutVal);
    if (FieldInfoInProcess() == false) {
        $("#loadingContainer").dialog("close");
        $("#loadingContainer").dialog("destroy");
        return 0
    } else if (timeOutValueInt - 500 <= 0) {
        $("#loadingContainer").dialog("close");
        $("#loadingContainer").dialog("destroy");
        return -1
    }
    timeOutValueInt = timeOutValueInt - 500;
    setTimeout("CheckFieldInfoProcess(" + timeOutValueInt + ")", 500)
}
function GetQueryStringArgs() {
    for (var args = {}, query = location.search.substring(1), pairs = query.split("&"), i = 0; i < pairs.length; i++) {
        var pos = pairs[i].indexOf("=");
        if (pos == -1)
            continue;
        var argname = pairs[i].substring(0, pos)
          , value = pairs[i].substring(pos + 1);
        args[argname] = unescape(value)
    }
    return args
}
function AddApplicationContextIndex(currentUrl) {
    var applicationIndex = GetQueryStringArgs().applicationContextIndex;
    if (applicationIndex && currentUrl.indexOf("applicationContextIndex") < 0)
        if (currentUrl.indexOf("?") >= 0)
            currentUrl = currentUrl + "&applicationContextIndex=" + applicationIndex;
        else
            currentUrl = currentUrl + "?applicationContextIndex=" + applicationIndex;
    return currentUrl
}
var _highlightOnFocus = null;
function BrowserSupprtHighlightOnFocus() {
    if (_highlightOnFocus == null) {
        _highlightOnFocus = true;
        if (navigator.userAgent.match(/msie/i))
            _highlightOnFocus = false;
        if (_highlightOnFocus != true && navigator.userAgent.toString().toLowerCase().indexOf("trident/6") > -1)
            _highlightOnFocus = true
    }
    return _highlightOnFocus
}
function FieldOnFocus(obj) {
    StoreLastFocusField(obj);
    var field = GetObj(obj.id);
    if (!BrowserSupprtHighlightOnFocus() && obj.tagName != "SELECT")
        field.className = field.className + " outline";
    SetPageFocusField(obj);
    if (obj.type != "select")
        g_currentlyFocusedList = "";
    try {
        if (getIEVersionNumber() == 6) {
            var selectProtectIframe = GetObj("expandList~iframe");
            if (selectProtectIframe.contentWindow.GetSrcSelect() == obj.id)
                selectProtectIframe.contentWindow.document.all("selectValue").className = "all clsSelectProtectWithFocus"
        }
    } catch (ex) {}
}
function FieldOnBlur(obj) {
    var field = GetObj(obj.id);
    field.className = field.className.replace(" outline", "");
    field.className = field.className.replace("outline", "")
}
function StoreLastFocusField(obj) {
    if (obj)
        g_lastFocusFieldId = obj.id
}
function ClearLastFocusField() {
    g_lastFocusFieldId = ""
}
function RestoreLastFocusField(rootObj) {
    !FocusChildControl(g_lastFocusFieldId, rootObj) && FocusFirstControl(rootObj)
}
function PageLoad() {
    CallIfFunctionExists("PageLoad" + g_currentPage);
    RegisterUpdatePanelEvents()
}
function BodyOnLoad() {
    StopTiming()
}
var g_currentPage;
function PagePostLoad() {
    if (!IsDialogActive()) {
        var pageFocusFunction = "PageFocus" + g_currentPage;
        !CallIfFunctionExists(pageFocusFunction) && RestoreLastFocusField();
        ShowPageMessage()
    }
    SetAdobeInstallCheckField()
}
var g_submitPage;
function ContinueButtonClick() {
    var functionName = "ContinueButtonClick" + g_currentPage;
    g_submitPage = true;
    if (IfFunctionExists(functionName))
        if (eval(functionName + "()")) {
            DisableAll();
            return true
        } else {
            g_submitPage = false;
            return false
        }
    else {
        DisableAll();
        return true
    }
}
function RegisterUpdatePanelEvents() {
    Sys.WebForms.PageRequestManager.getInstance().add_initializeRequest(UpdatePanelInitialize);
    Sys.WebForms.PageRequestManager.getInstance().add_beginRequest(UpdatePanelBegin);
    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(UpdatePanelEnd)
}
function UpdatePanelInProcess() {
    return g_updatePanelInProcess
}
function ShowFieldInfoInProgressWindow() {
    while (FieldInfoInProcess()) {
        var retval = ShowModalPopupWindow("trxInFlight.htm", "Blocker", 225, 75);
        if (retval == -1) {
            try {
                CleanUpFieldInfoTransaction()
            } catch (e) {
                alert(e.message)
            }
            g_transactionInProcess = false;
            return
        } else if (retval == 0)
            return
    }
}
function UpdatePanelInitialize() {
    ShowFieldInfoInProgressWindow()
}
function UpdatePanelBegin() {
    g_updatePanelInProcess = true;
    DisableAll();
    FieldInfoUpdatePanelBegin();
    g_pausePositionSelectProtect = true
}
function UpdatePanelEnd() {
    !IsDialogActive() && RestoreLastFocusField();
    EnableAll();
    ResizeMainDivWidth();
    UpdatePanelEndViolation();
    HandleTabs();
    g_updatePanelInProcess = false;
    StopTiming();
    g_pausePositionSelectProtect = false;
    CallIfFunctionExists(g_currentPage + "UpdatePanelEnd")
}
function UpdatePanelEndViolation() {
    g_lastFocusFieldId != null && g_lastFocusFieldId != "undefined" && (g_lastFocusFieldId.indexOf("NoDeleteButton") >= 0 && g_lastFocusFieldId.indexOf("VIO") >= 0) && ReloadPage()
}
function ReloadPage() {
    DisableAll();
    window.location.reload()
}
function IsEnabled(obj) {
    if (obj)
        return !obj.disabled;
    return false
}
function IsVisible(obj) {
    if (obj && obj.style.display != "none" && obj.style.visibility != "hidden" && (obj.type == null || obj.type != "hidden"))
        return true;
    return false
}
function AreAncestorsVisible(obj) {
    var parentObj = obj.parentNode;
    if (parentObj != null && parentObj.tagName != "BODY" && parentObj.tagName != "FORM")
        if (IsVisible(parentObj))
            return AreAncestorsVisible(parentObj);
        else
            return false;
    return true
}
function IsFocusable(obj) {
    if (obj && IsFocusableControlType(obj) && IsEnabled(obj) && IsVisible(obj) && AreAncestorsVisible(obj))
        return true;
    return false
}
function IsFocusableControlType(obj) {
    var isFocusable = false;
    if (obj)
        switch (obj.tagName) {
        case "SELECT":
        case "IMG":
        case "A":
        case "INPUT":
        case "TEXTAREA":
            isFocusable = true
        }
    return isFocusable
}
function IsHighlightedControl(obj) {
    if (obj && obj.tagName == "INPUT" && obj.type == "text")
        return true;
    return false
}
function FocusControl(targetControlId) {
    var targetControl = GetObj(targetControlId)
      , focused = false;
    if (targetControl && IsFocusable(targetControl))
        try {
            if (Sys.Browser.agent === Sys.Browser.InternetExplorer) {
                var focusTarget = targetControl;
                if (focusTarget && typeof focusTarget.contentEditable !== "undefined") {
                    oldContentEditableSetting = focusTarget.contentEditable;
                    focusTarget.contentEditable = false
                } else
                    focusTarget = null;
                if (IsHighlightedControl(targetControl)) {
                    var range = targetControl.createTextRange();
                    range.move("character", 0);
                    range.select()
                }
                targetControl.focus();
                if (focusTarget)
                    focusTarget.contentEditable = oldContentEditableSetting
            } else
                targetControl.focus();
            focused = true
        } catch (e) {}
    return focused
}
function FocusChildControl(targetControlId, rootObj) {
    var targetControl = GetObj(targetControlId)
      , focused = false;
    if (rootObj == null)
        rootObj = document.documentElement;
    if (targetControl)
        if (AjaxControlToolkit.DomUtility.isAncestorOrSelf(targetControl, rootObj))
            focused = FocusControl(targetControlId);
    return focused
}
function FocusFirstControl(rootObj) {
    for (var form = document.forms[0], i = 0; i < form.elements.length; i++) {
        var thisObj = form.elements.item(i);
        if ($(thisObj).parents != "undefined" && $(thisObj).parents("table[handletabs]").length > 0 && $(thisObj).closest("td").index() > 1)
            continue;
        if (FocusChildControl(thisObj.id, rootObj))
            break
    }
}
function AdjustWrapper(scrollWidth, scrollHeight, wrapperDiv, innerDiv, scrollBarPadding, divWrapperAdj, preset, alwaysPadForScroll) {
    var scrollBarSize = 17 + scrollBarPadding;
    if (divWrapperAdj == null)
        divWrapperAdj = 0;
    if (alwaysPadForScroll) {
        divWrapperAdj += scrollBarSize;
        scrollBarSize = 0
    }
    var bounds = GetTotalElementBounds(innerDiv)
      , width = bounds.width + divWrapperAdj
      , height = bounds.height + divWrapperAdj;
    if (preset) {
        wrapperDiv.style.width = width + "px";
        wrapperDiv.style.height = height + "px";
        bounds = GetTotalElementBounds(innerDiv);
        width = bounds.width + divWrapperAdj;
        height = bounds.height + divWrapperAdj
    }
    if (width > scrollWidth && scrollWidth != 0) {
        width = scrollWidth;
        height += scrollBarSize
    }
    if (height > scrollHeight && scrollHeight != 0) {
        height = scrollHeight;
        width += scrollBarSize;
        if (width > scrollWidth && scrollWidth != 0)
            width = scrollWidth
    }
    wrapperDiv.style.width = width + "px";
    wrapperDiv.style.height = height + "px"
}
function ClearInputData(rootObj) {
    for (var children = rootObj.childNodes, i = 0; i < children.length; i++)
        if (children[i].tagName == "INPUT") {
            if (children[i].attributes["Clear"] && children[i].attributes["Clear"].value == "true")
                if (children[i].type == "checkbox") {
                    children[i].checked = false;
                    FldOnChange(children[i], false);
                    UpdateCheckBoxChanged(children[i])
                } else if (children[i].type == "text") {
                    var emptyValue = "";
                    if (children[i].getAttribute("mask") != null)
                        emptyValue = GetEmptyMask(children[i]);
                    children[i].value = emptyValue;
                    FldOnChange(children[i], false)
                }
        } else if (children[i].tagName == "SELECT") {
            if (children[i].attributes["Clear"] && children[i].attributes["Clear"].value == "true") {
                if (children[i].options[0] != null && children[i].options[0].text != "") {
                    var e = document.createElement("OPTION");
                    e.text = "";
                    e.value = "";
                    children[i].options.add(e, 0)
                }
                children[i].selectedIndex = 0;
                FldOnChange(children[i], false)
            }
        } else
            children[i].childNodes.length > 0 && ClearInputData(children[i])
}
function DisableInputControls() {
    var obj;
    for (i = 0; i < document.forms[0].elements.length; i++) {
        obj = document.forms[0].elements[i];
        if (IsFocusable(obj))
            !obj.disabled && Sys.UI.DomElement.addCssClass(obj, "disabled")
    }
}
function CancelKeyDown() {
    StopPropagationAndPreventDefault()
}
function EnableInputControls() {
    var obj;
    for (i = 0; i < document.forms[0].elements.length; i++) {
        obj = document.forms[0].elements[i];
        if (IsFocusable(obj))
            !obj.disabled && Sys.UI.DomElement.removeCssClass(obj, "disabled")
    }
}
function DisableAll() {
    $("body").css("cursor", "wait");
    SetDocumentKeyDownCancel();
    ShowFieldInfoInProgressWindow();
    CallIfFunctionExists("DisablePage");
    CallIfFunctionExists("DisableInputControls");
    CallIfFunctionExists("DisableMenuControl");
    SetInsideWindowUnload(true)
}
function EnableAll() {
    $("body").css("cursor", "default");
    SetDocumentKeyDownHandler();
    CallIfFunctionExists("EnablePage");
    CallIfFunctionExists("EnableMenuControl");
    CallIfFunctionExists("EnableInputControls");
    SetInsideWindowUnload(false)
}
function SetInsideWindowUnload(switchFlag) {
    if (switchFlag)
        g_insideWindowUnload = true;
    else
        g_insideWindowUnload = false
}
function SetPopupBlockerInd(switchFlag) {
    if (switchFlag)
        g_popupBlockerUnload = true;
    else
        g_popupBlockerUnload = false
}
function SetCloseWindowIndicator(switchFlag) {
    if (switchFlag)
        g_closeWindow = true;
    else
        g_closeWindow = false
}
function OpenQuotingWindow() {
    var w = document.documentElement.clientWidth
      , h = document.documentElement.clientHeight
      , winparms = "status=yes,resizable=yes,scrollbars=yes,width=" + w + ",height=" + h + ",left=0,top=0"
      , win = "sbrnewquote" + Math.round(Math.random() * 1e5);
    window.open("", win, winparms);
    window.document.forms[0].target = win;
    setTimeout(function() {
        window.document.forms[0].target = ""
    }, 500)
}
function StartTiming() {
    if (!g_startTimeCaptured) {
        var startDate = new Date
          , ic = new InetCookie;
        ic.setCrumb("submitTimeNet", startDate.valueOf());
        g_startTimeCaptured = true
    }
}
function StopTiming() {
    var stopDate = new Date
      , ic = new InetCookie;
    ic.setCrumb("loadTime", stopDate.valueOf());
    g_startTimeCaptured = false
}
function IsAcrobatReaderInstalled() {
    for (var acrobatInstalled = false, acrobatVersion = "0", pdfObj, i = 1; i < 10; i++) {
        try {
            pdfObj = new ActiveXObject("AcroPDF.PDF." + i)
        } catch (e) {
            continue
        }
        if (pdfObj) {
            acrobatInstalled = true;
            acrobatVersion = "7 or higher";
            break
        }
    }
    if (!acrobatInstalled)
        for (var i = 1; i < 10; i++) {
            try {
                pdfObj = new ActiveXObject("PDF.PdfCtrl." + i)
            } catch (e) {
                continue
            }
            if (pdfObj) {
                acrobatInstalled = true;
                acrobatVersion = i;
                break
            }
        }
    return acrobatInstalled
}
function GetqueryStringValue(key) {
    queryStringSubpart = window.location.search.substring(1);
    keyValuePairs = queryStringSubpart.split("&");
    for (i = 0; i < keyValuePairs.length; i++) {
        keyValuePair = keyValuePairs[i].split("=");
        if (keyValuePair[0] == key)
            return keyValuePair[1]
    }
}
function RedirectToUrl(url) {
    var parent = window.opener;
    if (parent)
        if (parent.closed) {
            var newWin = window.open(url);
            newWin.opener = null;
            window.opener = newWin;
            newWin.focus()
        } else {
            parent.location = url;
            parent.focus()
        }
    else
        window.location = url
}
var g_pageMsgId;
function ShowPageMessage() {
    var pageMessage = GetObjValue(g_pageMsgId);
    pageMessage != "" && alert(pageMessage)
}
var g_adobeId;
function SetAdobeInstallCheckField() {
    var adobeInstalled = GetObj(g_adobeId);
    if (adobeInstalled.value != "")
        return;
    if (IsAcrobatReaderInstalled())
        adobeInstalled.value = "Y";
    else
        adobeInstalled.value = "N"
}
var g_disablePageId;
function DisablePage() {
    var behavior = $find(g_disablePageId);
    if (!behavior) {
        window.setTimeout("DisablePage()", 50);
        return
    }
    if (g_disablePageMutex == 0)
        behavior != null && behavior.show();
    g_disablePageMutex++
}
function EnablePage() {
    g_disablePageMutex--;
    if (g_disablePageMutex < 0)
        g_disablePageMutex = 0;
    if (g_disablePageMutex == 0) {
        var behavior = $find(g_disablePageId);
        behavior != null && behavior.hide()
    }
}
window.onunload = OnUnload;
function OnUnload() {
    IsWindowCloseClicked() && NavigateLinks("SaveOnUnload")
}
window.onbeforeunload = OnBeforeUnload;
function OnBeforeUnload() {
    StartTiming()
}
window.onresize = ResizeWindow;
var currentWindowHeight = document.documentElement.clientHeight
  , currentWindowWidth = document.documentElement.clientWidth;
function ResizeWindow() {
    if (currentWindowHeight != document.documentElement.clientHeight || currentWindowWidth != document.documentElement.clientWidth) {
        ResizeMainDiv();
        currentWindowHeight = document.documentElement.clientHeight;
        currentWindowWidth = document.documentElement.clientWidth
    }
}
var g_focusFldId;
function SetPageFocusField(field) {
    var _obj = GetObj(g_focusFldId);
    if (_obj)
        if (field.getAttribute("name"))
            _obj.value = field.getAttribute("name");
        else
            _obj.value = field.getAttribute("id")
}
function GetPageFocusFld() {
    return GetObjValue(g_focusFldId)
}
var g_nextPageId;
function NavigateToNextPage() {
    var ctrl = GetObj(g_nextPageId);
    ctrl && ctrl.click()
}
var g_smTimeout;
function GetScriptManagerTimeout() {
    return g_smTimeout
}
var g_fieldInfoUrl;
function GetFieldInfoService() {
    return g_fieldInfoUrl
}
function SetDefaultFocus(group, fieldIDToFocus) {
    var i = 0
      , index = group + "." + i + "."
      , fieldToFocus = $get(index + fieldIDToFocus);
    while (fieldToFocus) {
        if (fieldToFocus && fieldToFocus.value == "") {
            fieldToFocus.focus();
            return true
        }
        i = i + 1;
        index = group + "." + i + ".";
        fieldToFocus = $get(index + fieldIDToFocus)
    }
}
function SetLastFocus(group, fieldIDToFocus, indexToFocus) {
    var i = 0
      , index = group + "." + indexToFocus + "."
      , fieldToFocus = $get(index + fieldIDToFocus);
    fieldToFocus && fieldToFocus.focus()
}
function InetCookie() {
    this.toString = function() {
        return document.cookie
    }
    ;
    this.setCrumb = _setCrumb;
    this.getCrumb = _getCrumb;
    function _setCrumb(key, val) {
        var myDomain = BaseDomainString();
        if (myDomain.length > 0)
            document.cookie = key + "=" + escape(val) + ";path=/;domain=" + myDomain;
        else
            document.cookie = key + "=" + escape(val) + ";path=/"
    }
    function _getCrumb(key) {
        var _re = new RegExp("(" + key + ")(?:=?)([^;]*)","i")
          , _m = this.toString().match(_re);
        return _m == null || _m[2] == "" ? null : _m[2]
    }
}
function BaseDomainString() {
    var parts = document.domain.split(/\./);
    if (parts.length > 1)
        return parts[parts.length - 2] + "." + parts[parts.length - 1];
    else
        return ""
}
function getCookie(name) {
    if (document.cookie.length > 0) {
        start = document.cookie.indexOf(name + "=");
        if (start != -1) {
            start = start + name.length + 1;
            end = document.cookie.indexOf(";", start);
            if (end == -1)
                end = document.cookie.length;
            return unescape(document.cookie.substring(start, end))
        }
    }
    return null
}
function deleteCookie(name) {
    if (getCookie(name)) {
        var myDomain = BaseDomainString();
        if (myDomain.length > 0)
            document.cookie = name + "=;expires=Thu, 01-Jan-1970 00:00:01 GMT;path=/;domain=" + myDomain;
        else
            document.cookie = name + "=;expires=Thu, 01-Jan-1970 00:00:01 GMT;path=/"
    }
}
function setCookie(name, value, expires, path, domain, secure) {
    var myDomain = BaseDomainString();
    today = new Date;
    today.setTime(today.getTime());
    if (expires)
        expires = expires * 1e3 * 60 * 60 * 24;
    var expires_date = new Date(today.getTime() + expires);
    document.cookie = name + "=" + escape(value) + (expires ? ";expires=" + expires_date.toGMTString() : "") + (path ? ";path=" + path : "") + (domain ? ";domain=" + myDomain : "") + (secure ? ";secure" : "")
}
var g_keyPageUp = 33, g_keyPageDown = 34, g_keyLeftArrow = 37, g_keyUpArrow = 38, g_keyRightArrow = 39, g_keyDownArrow = 40, g_keyEscape = 27, g_keyEnter = 13, g_keyTab = 9, g_keySpace = 32, g_keyF1 = 112, g_keyF2 = 113, g_keyF3 = 114, g_keyF4 = 115, g_keyF5 = 116, g_keyF6 = 117, g_keyF7 = 118, g_keyF8 = 119, g_keyF9 = 120, g_keyF10 = 121, g_keyF11 = 122, g_keyF12 = 123, g_keyBackspace = 8, g_keyInsert = 45, g_keyDelete = 46, g_keyPopup = 93, g_keyHome = 36, g_keyEnd = 35, g_keyWindows = 92, g_keyNumSlash = 111, g_keyNumStar = 106, g_keyNumMinus = 109, g_keyNumPlus = 107, g_keyNumDot = 110, g_keyNumZero = 96, g_keyNumOne = 97, g_keyNumTwo = 98, g_keyNumThree = 99, g_keyNumFour = 100, g_keyNumFive = 101, g_keyNumSix = 102, g_keyNumSeven = 103, g_keyNumEight = 104, g_keyNumNine = 105, g_keyNumLock = 144, g_keyW = 87, g_keyw = 119, g_keyCode, g_bAltKey, g_bEscapeKey, g_bTabKey, g_keyShift = 16, g_keyCntrl = 17, g_keyAlt = 18, g_keyEscape = 27, g_scrollbarWidth = 16, g_statusBarHeight = 24, g_mainDivWrapperHorizontalScrollBarThreshold = 8, g_mainDivWrapperVerticalScrollBarThreshold = 124, g_currentlyExpandedList = "", g_currentlyFocusedList = "";
function setDefaultSelectValue(objSrcList, updateDependancies, defaultValueWhenEmpty) {
    if (objSrcList.selectedIndex != -1 && objSrcList.selectedIndex != 0)
        return;
    var iOptions = objSrcList.options.length
      , bSetDefault = objSrcList.getAttribute("setdefaultvalue") == "true"
      , originalSelIndex = objSrcList.selectedIndex;
    if (iOptions == 0)
        return;
    if (iOptions == 1)
        objSrcList.selectedIndex = 0;
    if (iOptions == 2 && objSrcList.options[0].text == "")
        objSrcList.selectedIndex = 1;
    if (bSetDefault)
        if (defaultValueWhenEmpty == undefined || defaultValueWhenEmpty == "")
            SelectFirstNonBlankValue(objSrcList);
        else
            SetSelectListEmptyDefaultValue(objSrcList, defaultValueWhenEmpty);
    if (originalSelIndex != objSrcList.selectedIndex) {
        FldOnChange(objSrcList, updateDependancies);
        if (bSetDefault && objSrcList.OnDefault)
            eval(objSrcList.OnDefault)
    }
}
function SelectFirstNonBlankValue(objSrcList) {
    if (objSrcList.options[0].text == "")
        objSrcList.selectedIndex = 1;
    else
        objSrcList.selectedIndex = 0
}
function SetSelectListEmptyDefaultValue(objSrcList, defaultValueWhenEmpty) {
    for (var dfltIdx = -1, i = 0; i < objSrcList.options.length; i++) {
        var val = objSrcList.options[i].value;
        if (val == defaultValueWhenEmpty) {
            dfltIdx = i;
            break
        }
    }
    if (dfltIdx == -1)
        SelectFirstNonBlankValue(objSrcList);
    else
        objSrcList.selectedIndex = dfltIdx
}
function SelectFirstItem(objExpandList) {
    if (objExpandList.selectedIndex == -1)
        if (objExpandList.options.length > 0)
            objExpandList.selectedIndex = 0
}
function donothing() {
    event.cancelBubble = true;
    event.returnValue = false;
    return false
}
function enableThis(orgSel) {
    orgSel.disabled = false
}
function GetCommonSelect() {
    return GetObj("expandList~common~select")
}
function GetExpandListDiv() {
    return GetObj("expandList~common")
}
function GetIframeExpandList() {
    return GetIFrameExpandListDiv().contentWindow.document.all("expandList~common~iframe~select")
}
function GetIFrameExpandListDiv() {
    return GetObj("expandList~common~iframe")
}
function GetIFrameSelectProtectDiv() {
    return GetObj("expandList~iframe~closehdlr")
}
function GetselectProtectDiv() {
    return GetObj("selectProtect")
}
function GetselectProtectCloseHdlr() {
    return GetObj("selectProtectCloseHdlr")
}
function getIEVersionNumber() {
    var ua = navigator.userAgent
      , MSIEOffset = ua.indexOf("MSIE ");
    if (MSIEOffset == -1)
        return 0;
    else
        return parseFloat(ua.substring(MSIEOffset + 5, ua.indexOf(";", MSIEOffset)))
}
function showExpand(objSrcList) {
    if (objSrcList.AutoWidth == "N" || g_pausePositionSelectProtect == true)
        return;
    g_bEscapeKey = false;
    g_bTabKey = false;
    ShowExpandList(objSrcList)
}
function ShowExpandList(objSrcList) {
    var base = GetExpandListDiv()
      , commonSelect = GetCommonSelect();
    clearCommonSelect(commonSelect);
    PopulateCommonSelect(objSrcList, commonSelect);
    SetExpandListHeight(commonSelect);
    commonSelect.srcList = objSrcList.id;
    if (objSrcList.selectedIndex != -1)
        commonSelect.selectedIndex = objSrcList.selectedIndex;
    else if (commonSelect.options.length > 0 && objSrcList.SetDefaultValue == "true")
        commonSelect.selectedIndex = 0;
    PositionExpandList(objSrcList, base, commonSelect);
    base.isOpen = "Y"
}
function PositionExpandList(objSrcList, commonContainer, commonSelect) {
    var srcWidth = objSrcList.offsetWidth
      , srcHeight = objSrcList.offsetHeight
      , ptPosArr = $common.getLocation(objSrcList)
      , srcAbsTop = ptPosArr.y
      , srcAbsLeft = ptPosArr.x;
    ResetPosition(commonContainer, srcAbsLeft, srcAbsTop, 1, 1);
    commonSelect.style.display = "";
    var commonWidth = commonSelect.offsetWidth
      , commonHeight = commonSelect.offsetHeight;
    if (getIEVersionNumber() != 6)
        commonContainer.style.clip = "rect(0," + commonWidth + "," + commonHeight + ",0)";
    if (objSrcList.offsetWidth > commonWidth) {
        commonWidth = objSrcList.offsetWidth;
        commonSelect.style.width = commonWidth + "px"
    }
    var verticalScrollbarWidth = g_scrollbarWidth
      , widthNeeded = srcAbsLeft + commonWidth + verticalScrollbarWidth
      , commonLeft = srcAbsLeft;
    if (widthNeeded > document.documentElement.clientWidth)
        if (srcAbsLeft + srcWidth - commonWidth - verticalScrollbarWidth > 0)
            commonLeft = srcAbsLeft + srcWidth - commonWidth;
        else {
            commonLeft = 0;
            if (commonWidth > document.documentElement.clientWidth - verticalScrollbarWidth) {
                commonWidth = document.documentElement.clientWidth - verticalScrollbarWidth + 1;
                if (getIEVersionNumber() != 6)
                    commonContainer.style.clip = "rect(0," + commonWidth + "," + commonHeight + ",0)"
            }
        }
    var horizontalScrollbarHeight = GetHorizontalScrollbarHeightIfVisible()
      , heightNeeded = srcAbsTop + commonHeight + horizontalScrollbarHeight + g_statusBarHeight
      , commonTop = srcAbsTop + srcHeight;
    if (heightNeeded > document.documentElement.clientHeight)
        commonTop = srcAbsTop - commonHeight;
    var arr = SetSelectListHeaderContent(commonContainer, objSrcList, commonWidth);
    if (arr[0] != 0) {
        commonHeight = commonHeight + arr[1];
        commonWidth = arr[0]
    }
    ResetPosition(commonContainer, commonLeft, commonTop, commonWidth, commonHeight);
    if (getIEVersionNumber() != 6)
        commonContainer.style.clip = "rect(0," + commonWidth + "," + commonHeight + ",0)";
    SetFocusToObj(commonSelect)
}
function SetSelectListHeaderContent(commonContainer, objSrcList, commonWidth) {
    var retunVal = 0
      , arr = new Array(2);
    arr[0] = 0;
    arr[1] = 0;
    try {
        var selHeaderTbl = null, srcHdrTbl = GetObj(objSrcList.id + "_tblSW"), commenSelect;
        if (getIEVersionNumber() != 6) {
            selHeaderTbl = GetObj("commonHeadingTable");
            commenSelect = GetCommonSelect()
        } else {
            selHeaderTbl = commonContainer.contentWindow.SetHeaderTable();
            commenSelect = GetIframeExpandList()
        }
        if (srcHdrTbl == null) {
            selHeaderTbl.style.display = "none";
            if (commenSelect.className.indexOf("expListFixed", 0) != -1)
                commenSelect.className = commenSelect.className.replace(/expListFixed /, "");
            arr[0] = 0;
            arr[1] = 0;
            return arr
        }
        selHeaderTbl.style.display = "";
        selHeaderTbl.rows[0].cells[0].innerText = srcHdrTbl.rows[0].cells[0].innerText;
        selHeaderTbl.rows[1].cells[0].innerText = srcHdrTbl.rows[1].cells[0].innerText;
        selHeaderTbl.rows[2].cells[0].innerText = srcHdrTbl.rows[2].cells[0].innerText;
        selHeaderTbl.rows[2].cells[1].innerText = srcHdrTbl.rows[2].cells[1].innerText;
        if (getIEVersionNumber() != 6) {
            var brElement = document.createElement("P");
            selHeaderTbl.rows[1].cells[0].appendChild(brElement)
        }
        for (var iLen = 0, i = 0; i < commenSelect.options.length; i++) {
            var txt = commenSelect.options[i].text;
            if (iLen < txt.length)
                iLen = txt.length
        }
        var selWidth = commonWidth;
        arr[0] = commonWidth;
        if (commonWidth < iLen * 8) {
            selWidth = iLen * 8;
            commenSelect.style.width = selWidth + "px";
            commonContainer.style.width = selWidth + "px";
            arr[0] = selWidth
        }
        commenSelect.className = "expListFixed " + commenSelect.className;
        selHeaderTbl.className = "expListFixed " + commenSelect.className;
        retunVal = selHeaderTbl.offsetHeight;
        selHeaderTbl.style.width = selWidth + "px";
        arr[1] = selHeaderTbl.offsetHeight
    } catch (e) {}
    return arr
}
function SetFocusToObj(obj) {
    try {
        StoreLastFocusField(obj);
        obj.focus()
    } catch (e) {}
}
function closeExpandList(commonSelect, bSetSelected) {
    var originalSelect = GetObj(commonSelect.srcList);
    if (getIEVersionNumber() != 6)
        GetExpandListDiv().style.display = "none";
    commonSelect.style.display = "none";
    commonSelect.style.width = "auto";
    var selectedText = "";
    if (bSetSelected)
        if (commonSelect.selectedIndex != -1 && (originalSelect.AllowBlankOption == "true" || commonSelect.value != "")) {
            var selChanged = false;
            if (originalSelect.selectedIndex != commonSelect.selectedIndex)
                selChanged = true;
            originalSelect.selectedIndex = commonSelect.selectedIndex;
            if (selChanged == true) {
                selectedText = commonSelect.options[commonSelect.selectedIndex].text;
                if (document.createEventObject)
                    originalSelect.fireEvent("onchange");
                else {
                    var onChangeEvent = document.createEvent("onchange");
                    originalSelect.dispatchEvent(onChangeEvent)
                }
            }
        }
    if (getIEVersionNumber() == 6) {
        selectedText != "" && GetObj("expandList~iframe").contentWindow.SetSelectText(selectedText);
        GetIFrameExpandListDiv().isOpen = "N"
    } else {
        GetExpandListDiv().isOpen = "N";
        ResetPosition(GetselectProtectCloseHdlr(), 0, 0, 0, 0)
    }
}
function showOriginalSelect(commonSelect, bSetSelected) {
    var originalSelect = GetObj(commonSelect.srcList);
    closeExpandList(commonSelect, bSetSelected);
    originalSelect.disabled = false;
    if (getIEVersionNumber() == 6) {
        var range = document.selection.createRange()
          , obj = range.parentElement();
        obj != null && obj.id == "" && SetFocusToObj(originalSelect)
    } else
        SetFocusToObj(originalSelect)
}
function PlaceSelectProtect(objSrcList) {
    if (getIEVersionNumber() == 6) {
        var iframe = GetObj("expandList~iframe");
        if (iframe != null) {
            if (iframe.readyState != "complete") {
                window.setTimeout("PlaceSelectProtect(GetObj('" + objSrcList.id + "'))", 5);
                return
            }
        } else {
            window.setTimeout("PlaceSelectProtect(GetObj('" + objSrcList.id + "'))", 5);
            return
        }
    }
    ScrollToMakeActiveSelectVisible(objSrcList);
    var ptPosArr = $common.getLocation(objSrcList)
      , elemAbsTop = ptPosArr.y
      , elemAbsLeft = ptPosArr.x;
    if (getIEVersionNumber() == 6) {
        var iframe = GetObj("expandList~iframe")
          , selectedText = "";
        if (objSrcList.selectedIndex != -1)
            selectedText = objSrcList.options[objSrcList.selectedIndex].text;
        try {
            iframe.contentWindow.SetSrcSelect(objSrcList.id, selectedText)
        } catch (e) {}
        var verticalScrollbarWidth = g_scrollbarWidth
          , clippedWidth = objSrcList.offsetWidth;
        if (objSrcList.offsetWidth > document.documentElement.clientWidth - verticalScrollbarWidth) {
            clippedWidth = document.documentElement.clientWidth - verticalScrollbarWidth;
            iframe.style.clip = "rect(0," + clippedWidth + "," + objSrcList.offsetHeight + ",0)"
        } else
            iframe.style.clip = "rect(0," + objSrcList.offsetWidth + "," + objSrcList.offsetHeight + ",0)";
        try {
            if (g_currentlyFocusedList == objSrcList.id || document.activeElement.id == objSrcList.id)
                iframe.contentWindow.document.all("selectValue").className = "all clsSelectProtectWithFocus";
            else
                iframe.contentWindow.document.all("selectValue").className = "all"
        } catch (ex) {}
        ResetPosition(iframe, elemAbsLeft, elemAbsTop, clippedWidth, objSrcList.offsetHeight)
    } else {
        ResetPosition(GetselectProtectDiv(), elemAbsLeft, elemAbsTop, objSrcList.offsetWidth, objSrcList.offsetHeight);
        GetselectProtectDiv().hiddenSelect = objSrcList.id
    }
}
function SimulateSelectClick(hiddenSelect) {
    if (hiddenSelect != "") {
        if (g_pausePositionSelectProtect == true)
            return false;
        var objSrcList = GetObj(hiddenSelect);
        if (!objSrcList.disabled) {
            GetselectProtectCloseHdlr().hiddenSelect = hiddenSelect;
            var ptPosArr = $common.getLocation(objSrcList)
              , elemAbsTop = ptPosArr.y
              , elemAbsLeft = ptPosArr.x;
            ResetPosition(GetselectProtectCloseHdlr(), elemAbsLeft, elemAbsTop, objSrcList.offsetWidth + 5, objSrcList.offsetHeight + 5, true);
            showExpand(GetObj(hiddenSelect))
        }
    }
}
function GetHorizontalScrollbarHeightIfVisible() {
    var mainDivWrapper = GetObj("mainDivWrapper")
      , mainDiv = GetObj("mainDiv")
      , horizontalScrollbarHeight = 0;
    if (mainDivWrapper != null && mainDiv != null) {
        var mainDivWrapperBounds = GetContentBounds(mainDivWrapper)
          , mainDivBounds = GetContentBounds(mainDiv);
        if (mainDivWrapperBounds.width - mainDivBounds.width < g_mainDivWrapperHorizontalScrollBarThreshold)
            horizontalScrollbarHeight = g_scrollbarWidth
    } else
        horizontalScrollbarHeight = g_scrollbarWidth;
    return horizontalScrollbarHeight
}
function GetVerticalScrollbarWidthIfVisible() {
    var mainDivWrapper = GetObj("mainDivWrapper")
      , mainDiv = GetObj("mainDiv")
      , verticalScrollbarWidth = 0;
    if (mainDivWrapper != null && mainDiv != null) {
        var mainDivWrapperBounds = GetContentBounds(mainDivWrapper)
          , mainDivBounds = GetContentBounds(mainDiv);
        if (mainDivWrapperBounds.height - mainDivBounds.height < g_mainDivWrapperVerticalScrollBarThreshold)
            verticalScrollbarWidth = g_scrollbarWidth
    } else
        verticalScrollbarWidth = g_scrollbarWidth;
    return verticalScrollbarWidth
}
function ScrollToMakeActiveSelectVisible(objSrcList) {
    var mainDivWrapper = GetObj("mainDivWrapper")
      , srcWidth = objSrcList.offsetWidth
      , srcHeight = objSrcList.offsetHeight
      , ptPosArr = $common.getLocation(objSrcList)
      , srcAbsTop = ptPosArr.y
      , srcAbsLeft = ptPosArr.x
      , horizontalScrollbarHeight = GetHorizontalScrollbarHeightIfVisible()
      , verticalScrollbarWidth = g_scrollbarWidth
      , leftScrollPos = mainDivWrapper.scrollLeft
      , amtToScroll = 0;
    if (document.documentElement.clientWidth - verticalScrollbarWidth < srcAbsLeft + srcWidth) {
        amtToScroll = srcAbsLeft + srcWidth + verticalScrollbarWidth - document.documentElement.clientWidth;
        mainDivWrapper.scrollLeft = leftScrollPos + amtToScroll
    }
    ptPosArr = $common.getLocation(objSrcList);
    srcAbsLeft = ptPosArr.x;
    if (srcAbsLeft < 0)
        mainDivWrapper.scrollLeft = mainDivWrapper.scrollLeft + srcAbsLeft - 1;
    var topScrollPos = mainDivWrapper.scrollTop;
    if (document.documentElement.clientHeight - horizontalScrollbarHeight < srcAbsTop + srcHeight) {
        amtToScroll = srcAbsTop + srcHeight + horizontalScrollbarHeight - document.documentElement.clientHeight;
        mainDivWrapper.scrollTop = topScrollPos + amtToScroll
    }
    var mainDivWrapperBounds = GetContentBounds(GetObj("mainDivWrapper"));
    if (srcAbsTop < mainDivWrapperBounds.y)
        mainDivWrapper.scrollTop = topScrollPos - (mainDivWrapperBounds.y - srcAbsTop) - 1
}
function IFrameSimulateSelectClick(srcListId) {
    if (g_pausePositionSelectProtect == true)
        return false;
    var objSrcList = GetObj(srcListId);
    if (!objSrcList.disabled) {
        g_currentlyFocusedList != "" && g_currentlyFocusedList != srcListId && g_currentlyExpandedList != "" && CollapseCommonSelectIframe(g_currentlyExpandedList, false);
        g_currentlyFocusedList = srcListId;
        g_currentlyExpandedList = srcListId;
        GetIframeExpandList().style.width = "auto";
        clearCommonSelect(GetIframeExpandList());
        PopulateCommonSelect(objSrcList, GetIframeExpandList());
        SetExpandListHeight(GetIframeExpandList());
        GetIFrameExpandListDiv().contentWindow.SetSrcSelect(srcListId);
        GetIFrameSelectProtectDiv().contentWindow.SetSrcSelect(srcListId, GetSelectText(objSrcList));
        var commandString = "IFrameSimulateSelectClickPart2('" + srcListId + "')";
        window.setTimeout(commandString, 5)
    }
}
function IFrameSimulateSelectClickPart2(SrcList) {
    var objSrcList = GetObj(SrcList);
    PositionExpandList(objSrcList, GetIFrameExpandListDiv(), GetIframeExpandList());
    GetIframeExpandList().srcList = SrcList;
    if (objSrcList.selectedIndex != -1)
        GetIframeExpandList().selectedIndex = objSrcList.selectedIndex;
    else if (GetIframeExpandList().options.length > 0 && objSrcList.SetDefaultValue == "true")
        GetIframeExpandList().selectedIndex = 0;
    GetIFrameExpandListDiv().isOpen = "Y";
    GetObj("expandList~iframe~closehdlr").contentWindow.SetSelectText(GetSelectText(objSrcList));
    GetObj("expandList~iframe").contentWindow.SetSelectText(GetSelectText(objSrcList));
    var ptPosArr = $common.getLocation(objSrcList)
      , elemAbsTop = ptPosArr.y
      , elemAbsLeft = ptPosArr.x
      , closeHandlerIframe = GetObj("expandList~iframe~closehdlr")
      , verticalScrollbarWidth = g_scrollbarWidth
      , clippedWidth = objSrcList.offsetWidth;
    if (objSrcList.offsetWidth > document.documentElement.clientWidth - verticalScrollbarWidth) {
        clippedWidth = document.documentElement.clientWidth - verticalScrollbarWidth;
        closeHandlerIframe.style.clip = "rect(0," + clippedWidth + "," + objSrcList.offsetHeight + ",0)"
    } else
        closeHandlerIframe.style.clip = "rect(0," + objSrcList.offsetWidth + "," + objSrcList.offsetHeight + ",0)";
    ResetPosition(closeHandlerIframe, elemAbsLeft, elemAbsTop, clippedWidth, objSrcList.offsetHeight)
}
function GetSelectText(objSrcList) {
    var selectedText = "";
    if (objSrcList.selectedIndex != -1)
        selectedText = objSrcList.options[objSrcList.selectedIndex].text;
    return selectedText
}
function ExpandListSelectblur(expandListSelect) {
    !g_bEscapeKey && showOriginalSelect(expandListSelect, true)
}
function ExpandListSelectClick(expandListSelect) {
    showOriginalSelect(expandListSelect, true)
}
function BodyOnMouseDown() {
    g_currentlyExpandedList != "" && CollapseCommonSelectIframe(g_currentlyExpandedList, false);
    event.button != 1 && SetUnloadkeyCloseStatus()
}
function OnMouseDownNativeSelect(nativeSelectObj) {
    if (nativeSelectObj.disabled == false && (getIEVersionNumber() != 6 || !IsDialogActive())) {
        nativeSelectObj.disabled = true;
        event.cancelBubble = true;
        event.returnValue = false;
        PlaceSelectProtect(nativeSelectObj);
        window.setTimeout("EnableNativeSelect('" + nativeSelectObj.id + "')", 5);
        return false
    }
}
function EnableNativeSelect(nativeSelectId) {
    GetObj(nativeSelectId).disabled = false;
    if (getIEVersionNumber() != 6)
        SimulateSelectClick(nativeSelectId);
    else
        IFrameSimulateSelectClick(nativeSelectId)
}
function OnMouseOverCloseHandler() {
    var selectProtectId = ""
      , srcListId = "";
    if (getIEVersionNumber() == 6) {
        selectProtectId = GetObj("expandList~iframe").contentWindow.GetSrcSelect();
        srcListId = GetIFrameSelectProtectDiv().contentWindow.GetSrcSelect()
    } else {
        selectProtectId = GetselectProtectDiv().hiddenSelect;
        srcListId = GetselectProtectCloseHdlr().hiddenSelect
    }
    srcListId != selectProtectId && PlaceSelectProtect(GetObj(srcListId))
}
function CollapseCommonSelectIframe(srcListId, setFocusToSrclist) {
    var originalSelect = GetObj(srcListId)
      , commonSelect = GetIframeExpandList()
      , selectedText = "";
    if (commonSelect.selectedIndex != -1 && commonSelect.value != "") {
        var selChanged = false;
        if (originalSelect.selectedIndex != commonSelect.selectedIndex)
            selChanged = true;
        originalSelect.selectedIndex = commonSelect.selectedIndex;
        if (selChanged == true) {
            selectedText = commonSelect.options[commonSelect.selectedIndex].text;
            if (document.createEventObject)
                originalSelect.fireEvent("onchange");
            else {
                var onChangeEvent = document.createEvent("onchange");
                originalSelect.dispatchEvent(onChangeEvent)
            }
        }
    }
    selectedText != "" && GetObj("expandList~iframe").contentWindow.SetSelectText(selectedText);
    GetIFrameExpandListDiv().style.display = "none";
    GetIFrameSelectProtectDiv().style.display = "none";
    g_currentlyExpandedList = "";
    if (setFocusToSrclist) {
        originalSelect.disabled = false;
        SetFocusToObj(originalSelect)
    }
}
function ExpandListIframeSelectClick(expandListSelect) {
    showOriginalSelect(expandListSelect, true);
    GetIFrameExpandListDiv().style.display = "none";
    g_currentlyExpandedList = "";
    window.setTimeout("HideExpandListAndShrinkElement('expandList~iframe~closehdlr')", 5)
}
function HideExpandListAndShrinkElement(elementId) {
    var obj = GetObj(elementId);
    if (getIEVersionNumber() == 6) {
        var objExpandList = GetIframeExpandList();
        if (objExpandList != null)
            objExpandList.style.display = "none"
    } else
        GetExpandListDiv().style.display = "none";
    obj.style.position = "absolute";
    obj.style.left = 0 + "px";
    obj.style.top = 0 + "px";
    obj.style.width = 0 + "px";
    obj.style.height = 0 + "px"
}
function HandleKeyDown(srcSelect, strHandleSelectListKeyDown) {
    var obj = window.event.srcElement;
    g_keyCode = window.event.keyCode;
    g_bAltKey = event.altKey || event.altLeft;
    event.returnValue = true;
    switch (g_keyCode) {
    case g_keyEnter:
        if (IsExpandListOpened()) {
            event.cancelBubble = true;
            event.returnValue = false;
            toCollapse = true
        }
        break;
    case g_keyEscape:
        event.cancelBubble = true;
        event.returnValue = false;
        toCollapse = true
    }
    if (eval("typeof(" + strHandleSelectListKeyDown + ")") == "function")
        eval(strHandleSelectListKeyDown + "(srcSelect)")
}
function HandleIframeKeyDown(commonSelect, keyCode) {
    switch (keyCode) {
    case g_keyEnter:
        showOriginalSelect(commonSelect, true);
        break;
    case g_keyEscape:
        showOriginalSelect(commonSelect, true);
        break;
    case g_keyTab:
        showOriginalSelect(commonSelect, true);
        window.setTimeout("HideSelectListControls()", 5);
        g_currentlyExpandedList = "";
        g_currentlyFocusedList = "";
        return true
    }
    window.setTimeout("HideSelectListControls()", 5)
}
function HandleExpandListKeyDown(srcSelect) {
    g_bEscapeKey = false;
    g_bTabKey = false;
    switch (g_keyCode) {
    case g_keyEnter:
        showOriginalSelect(srcSelect, true);
        break;
    case g_keyEscape:
        g_bEscapeKey = true;
        showOriginalSelect(srcSelect, true);
        break;
    case g_keyTab:
        g_bEscapeKey = true;
        g_bTabKey = true;
        handleTabKey(GetCommonSelect());
        return true
    }
    return true
}
function UpdateSelectProtectIframeAfterKeyEvent(srcSelectId) {
    var selectProtectId = GetObj("expandList~iframe").contentWindow.GetSrcSelect();
    if (selectProtectId == srcSelectId) {
        var srcObj = GetObj(srcSelectId)
          , selectedText = srcObj.options[srcObj.selectedIndex].text;
        GetObj("expandList~iframe").contentWindow.SetSelectText(selectedText)
    }
}
function HandleSrcSelectKeyDown(srcSelect) {
    var commandString = "UpdateSelectProtectIframeAfterKeyEvent('" + srcSelect.id + "')";
    switch (g_keyCode) {
    case g_keyDownArrow:
        if (getIEVersionNumber() == 6 && IsDialogActive())
            return;
        getIEVersionNumber() == 6 && window.setTimeout(commandString, 5);
        if (g_bAltKey) {
            if (getIEVersionNumber() == 6) {
                event.cancelBubble = true;
                event.returnValue = false;
                IFrameSimulateSelectClick(srcSelect.id);
                SetFocusToObj(GetIframeExpandList());
                return false
            }
            showExpand(srcSelect)
        }
        break;
    case g_keyTab:
        g_currentlyFocusedList = "";
        if (getIEVersionNumber() == 6)
            window.setTimeout("HideSelectListControls()", 5);
        else
            GetExpandListDiv().isOpen == "Y" && window.setTimeout("HideSelectListControls()", 5);
        break;
    default:
        getIEVersionNumber() == 6 && window.setTimeout(commandString, 5)
    }
    return true
}
function handleTabKey(commonSelect) {
    showOriginalSelect(commonSelect, true);
    var newEvent;
    if (document.createEventObject)
        newEvent = document.createEventObject(event);
    else
        newEvent = document.createEvent(event);
    if (newEvent.returnValue == false) {
        event.cancelBubble = true;
        event.returnValue = false;
        return false
    }
    return true
}
function ResetPosition(objToRePos, elemAbsLeft, elemAbsTop, originalWidth, originalHeight) {
    objToRePos.style.position = "absolute";
    objToRePos.style.left = elemAbsLeft + "px";
    objToRePos.style.top = elemAbsTop + "px";
    objToRePos.style.width = originalWidth + "px";
    objToRePos.style.height = originalHeight + "px";
    objToRePos.style.display = ""
}
function SetExpandListHeight(expList) {
    expList.size = 10;
    if (expList.options.length < expList.size)
        expList.size = expList.options.length;
    if (expList.options.length <= 2)
        expList.size = 2
}
function clearCommonSelect(commonSelect) {
    while (commonSelect.options.length > 0)
        commonSelect.remove(0)
}
function PopulateCommonSelect(objSrcList, commonSelect) {
    var opt = null;
    if (objSrcList.options != null)
        for (var i = 0; i < objSrcList.options.length; i++) {
            opt = document.createElement("option");
            opt.value = objSrcList.options[i].value;
            opt.text = objSrcList.options[i].text;
            opt.disabled = PopulateAttributes(opt.text);
            commonSelect.options.add(opt)
        }
}
function DisableGroupHeadings(objSrcList) {
    var opt = null;
    if (objSrcList.options != null)
        for (var i = 0; i < objSrcList.options.length; i++)
            objSrcList.options[i].disabled = PopulateAttributes(objSrcList.options[i].text)
}
function PopulateAttributes() {
    return false
}
function IsExpandListOpened() {
    var isOpen = false;
    try {
        isOpen = GetExpandListDiv().isOpen == "Y"
    } catch (e) {
        isOpen = false
    }
    return isOpen
}
if (document.implementation.hasFeature("XPath", "3.0")) {
    XMLDocument.prototype.selectNodes = function(cXPathString, xNode) {
        if (!xNode)
            xNode = this;
        for (var oNSResolver = this.createNSResolver(this.documentElement), aItems = this.evaluate(cXPathString, xNode, oNSResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null), aResult = [], i = 0; i < aItems.snapshotLength; i++)
            aResult[i] = aItems.snapshotItem(i);
        return aResult
    }
    ;
    XMLDocument.prototype.selectSingleNode = function(cXPathString, xNode) {
        if (!xNode)
            xNode = this;
        var xItems = this.selectNodes(cXPathString, xNode);
        if (xItems.length > 0)
            return xItems[0];
        else
            return null
    }
    ;
    Element.prototype.selectNodes = function(cXPathString) {
        if (this.ownerDocument.selectNodes)
            return this.ownerDocument.selectNodes(cXPathString, this);
        else
            try {
                var output = []
                  , XPathResults = document.evaluate(cXPathString, this, null, XPathResult.ANY_TYPE, null)
                  , result = XPathResults.iterateNext();
                while (result) {
                    output.push(result);
                    result = XPathResults.iterateNext()
                }
                return output
            } catch (exc) {
                throw "For XML Elements Only"
            }
    }
    ;
    Element.prototype.selectSingleNode = function(cXPathString) {
        if (this.ownerDocument.selectSingleNode)
            return this.ownerDocument.selectSingleNode(cXPathString, this);
        else
            try {
                var XPathResults = document.evaluate(cXPathString, this, null, XPathResult.ANY_TYPE, null);
                return XPathResults.iterateNext()
            } catch (exc) {
                throw "For XML Elements Only"
            }
    }
}
function GetElementByIdOrName(id, formName) {
    var obj = GetObj(id);
    if (!obj)
        if (formName)
            return document.forms[formName].elements[id];
        else
            return document.forms[0].elements[id];
    else
        return obj
}
function GetSingleNodeText(xpath, contextNode) {
    return GetNodeTextFromNode(contextNode.selectSingleNode(xpath))
}
function GetNodeTextFromNode(node) {
    return $(node).text()
}
function GetXMLHTTPRequestType() {
    if (window.XMLHttpRequest)
        xmlhttp = new XMLHttpRequest;
    else
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    return xmlhttp
}
function LoadXMLDoc(sXml) {
    var rspDoc;
    try {
        rspDoc = new ActiveXObject("Microsoft.XMLDOM");
        rspDoc.async = false;
        rspDoc.loadXML(sXml)
    } catch (exc) {
        rspDoc = (new DOMParser).parseFromString(sXml, "text/xml")
    }
    return rspDoc
}
function RemoveOuterXMLComments(sXml) {
    sXml = sXml.replace(/^<!--/, "");
    sXml = sXml.replace(/-->$/, "");
    return sXml
}
function AddAllChildNodes(node, childArray) {
    for (var i = 0; i < node.childNodes.length; i++)
        if (IsValidAllNode(node.childNodes[i])) {
            childArray[childArray.length] = node.childNodes[i];
            node.childNodes[i].hasChildNodes && AddAllChildNodes(node.childNodes[i], childArray)
        }
}
function IsValidAllNode(node) {
    if (node.nodeType == 3 && node.nodeValue.trim().length == 0)
        return false;
    return true
}
function GetDocumentAllObjects(idStr) {
    var objects;
    if (document.all)
        objects = document.all(idStr);
    if (objects == null || objects.length == null)
        objects = document.getElementsByName(idStr);
    return objects
}
function AddEvent(obj, event, callback) {
    if (obj.addEventListener)
        obj.addEventListener(event, callback, true);
    else
        obj.attachEvent(event, callback)
}
function AddDOMEvent(event, callback) {
    AddEvent(window, event, callback)
}
function DetachEvent(obj, event, callback) {
    if (obj.removeEventListener)
        obj.removeEventListener(event, callback, true);
    else
        obj.detachEvent(event, callback)
}
function DetachDOMEvent(event, callback) {
    DetachEvent(window, event, callback)
}
function EventClass() {
    function SetCustomKey(val) {
        if (val != null)
            if (!window.event)
                try {
                    GlobalEventHandler.event.which = val
                } catch (e) {}
            else
                GlobalEventHandler.event.keyCode = val;
        if (!window.event)
            return GlobalEventHandler.event.which;
        else
            return GlobalEventHandler.event.keyCode
    }
    if (!window.event)
        GlobalEventHandler.event.srcElement = GlobalEventHandler.event.target;
    GlobalEventHandler.event.customKeyCode = SetCustomKey;
    return GlobalEventHandler.event
}
var EventObj = EventClass;
function GlobalEventHandler(evt) {
    g_GlobalEventObj = evt ? evt : window.event;
    GlobalEventHandler.event = g_GlobalEventObj
}
function FilterDataIsland(changedObj, dataIsland, xPath) {
    var xml = GetPageFieldRelationships()
      , doc = LoadXMLDoc(xml)
      , coverageExtractFilterDocument = IsLegacyIE() ? document.getElementById(dataIsland) : LoadXMLDoc(document.getElementById(dataIsland).textContent)
      , masterNodes = null;
    if (coverageExtractFilterDocument != null)
        masterNodes = coverageExtractFilterDocument.selectNodes(xPath);
    var changedFieldId = GetBaseFieldId(changedObj)
      , masterXpath = "//f[@id='" + changedFieldId + "' and f]"
      , dependent = "";
    if (masterNodes != null && masterNodes.length > 0) {
        var dataIslandFilter = masterNodes[0].getAttribute("DataIslandFilter")
          , sibling = masterNodes[0].getAttribute("Sibling")
          , master = masterNodes[0].getAttribute("master");
        dependent = masterNodes[0].getAttribute("dependent");
        if (dataIslandFilter) {
            VisitDependent(dataIslandFilter, changedObj, master, dependent);
            VisitSiblings(changedObj, sibling);
            LoopAllMainCovsforTrailer()
        }
    } else {
        masterXpath = "//f[@id='" + changedFieldId + "']";
        if (coverageExtractFilterDocument != null)
            masterNodes = coverageExtractFilterDocument.selectNodes(masterXpath);
        if (masterNodes != null && masterNodes.length > 0)
            for (var i = 0; i < masterNodes.length; i++)
                if (masterNodes[i].getAttribute("Sibling") != null) {
                    var sibling = masterNodes[i].getAttribute("Sibling");
                    VisitSiblings(changedObj, sibling);
                    LoopAllMainCovsforTrailer()
                }
    }
    ApplyDataIslandFilterChangesCA(masterNodes);
    SetDependantFields(doc, changedObj, FindAutoFilters(coverageExtractFilterDocument, changedObj))
}
function ApplyDataIslandFilterChangesCA(masterNodes) {
    var dependent = null
      , objField = null;
    if (masterNodes != null && masterNodes.length > 0)
        for (var i = 0; i < masterNodes.length; i++) {
            dependent = masterNodes[0].getAttribute("dependent");
            if (dependent != null) {
                objField = GetObj("VEH.0." + dependent);
                objField != null && FldOnChange(objField, false)
            }
        }
}
function FindAutoFilters(doc, changedObj) {
    var dependents = []
      , fieldExist = true
      , index = 0;
    while (fieldExist) {
        var changedFieldId = GetBaseFieldId(changedObj)
          , masterXpath = "//f[@id='" + changedFieldId + "' and f]"
          , masterNodes = doc.selectNodes(masterXpath);
        if (masterNodes == null || masterNodes.length <= 0) {
            fieldExist = false;
            break
        }
        var dependent = masterNodes[0].getAttribute("dependent");
        dependents[index] = dependent;
        index++;
        changedObj = GetObj("VEH.0." + dependent)
    }
    return dependents
}
function SetDependantFields(doc, changedObj, dependents) {
    var changedFieldId = GetBaseFieldId(changedObj)
      , masterXpath = "//f[@id='" + changedFieldId + "']"
      , masterNodes = doc.selectNodes(masterXpath)
      , dependentFields = PrepareDependantFields(changedObj, masterNodes)
      , updatedDependentFields = []
      , groupCount = GetGroupCount(changedObj)
      , fieldIndex = 0;
    if (dependents != "" && dependents != null && dependents.length > 0) {
        for (var index = 0; index < dependentFields.length; index = index + 2) {
            for (var IsUpdateDependantRequired = true, j = 0; j < dependents.length; j++)
                for (var i = 0; i < groupCount; i++) {
                    var dependentField = "VEH." + i + "." + dependents[j];
                    if (dependentFields[index].toUpperCase() == dependentField.toUpperCase()) {
                        IsUpdateDependantRequired = false;
                        break
                    }
                }
            if (IsUpdateDependantRequired) {
                updatedDependentFields[fieldIndex++] = dependentFields[index];
                updatedDependentFields[fieldIndex++] = dependentFields[index + 1]
            }
        }
        dependentFields = updatedDependentFields
    }
    if (dependentFields.length > 0) {
        var applicationIndex = GetQueryStringArgs().applicationContextIndex;
        QueueAndFireFieldInfo(g_changes, dependentFields, applicationIndex);
        g_changes = []
    }
}
function GetGroupCount(changedObj) {
    var parts = changedObj.name.split(".")
      , startPos = 0
      , groupCountControl = parts[startPos] + ".count"
      , groupCount = 0
      , group = GetObj(groupCountControl);
    if (group == null)
        return 0;
    groupCount = group.value;
    return groupCount
}
function IsSiblingRequired(changedObj) {
    for (var parts = changedObj.name.split("."), lastPos = GetGroupCount(changedObj), sourceControl = changedObj, j = 1; j < lastPos; j++) {
        var destControl = GetObj(parts[0] + "." + j + "." + parts[2]);
        if (destControl.disabled == false)
            return false
    }
    return true
}
function SetSiblingValues(changedObj) {
    for (var parts = changedObj.name.split("."), lastPos = GetGroupCount(changedObj), sourceControl = changedObj, j = 1; j < lastPos; j++) {
        var destControl = GetObj(parts[0] + "." + j + "." + parts[2]);
        CopyOptions(sourceControl, destControl)
    }
}
function GetClientControl(fieldId) {
    var controlId, control, newFieldId = fieldId;
    if (IsDialogActive())
        newFieldId = GetActiveDialog() + g_prefixSeparator + fieldId;
    for (var prefixes = GetControlPrefixes(), i = 0; i < prefixes.length; i++) {
        controlId = GetUniqueId(prefixes[i], newFieldId);
        control = GetObj(controlId);
        break
    }
    return control
}
function LoadFillOptions(obj, masterFields) {
    var previousIndex = masterFields.length - 1
      , fieldId = masterFields[previousIndex]
      , fieldObj = GetObj(fieldId)
      , masterIndices = GetEntityIndices(obj.id)
      , parts = fieldId.split(".");
    if (masterIndices[0] == 0 && fieldId != obj.id && fieldObj.value == "") {
        ClearOptions(obj);
        obj.value = "";
        FldOnChange(obj);
        g_lastClearField = obj.id
    } else if (masterIndices[0] > 0) {
        fieldId = parts[0] + ".0." + parts[2];
        fieldObj = GetObj(fieldId);
        if (obj.disabled == false && fieldId != obj.id && fieldObj.value == "") {
            ClearOptions(obj);
            obj.value = "";
            FldOnChange(obj)
        }
    }
}
function GetMasters(objId) {
    for (var mastersArrary = [], masterIndices = GetEntityIndices(objId), fldId = GetBaseFieldId(GetObj(objId)), masterXpath = "//f[@id='" + fldId + "']", pNodes = pageFieldXML.selectNodes(masterXpath), m = 0; m < pNodes.length; ++m) {
        var parent = pNodes[m].parentNode;
        if (parent.getAttribute("id") != null && parent.getAttribute("id") != fldId) {
            var field = parent.getAttribute("id");
            field = field.replace("/", "." + masterIndices[0] + ".");
            var obj = GetObj(field);
            obj && Array.indexOf(mastersArrary, field) <= 0 && field != objId && mastersArrary.push(field)
        }
    }
    return mastersArrary
}
var g_statusMsg;
function SetStatusMessage() {
    window.defaultStatus = g_statusMsg
}
function AppendDialogStyles(strCtrlPrefix, strCtrlId, strCtrlStyle) {
    var dlgCtrl = $get(strCtrlPrefix + strCtrlId);
    if (dlgCtrl)
        dlgCtrl.className = dlgCtrl.className + strCtrlStyle
}
function GetDialogField(field) {
    var dialogPathId = GetHiddenVariable("dialogPathId" + GetActiveDialog());
    return GetClientControl(GetObj(dialogPathId).value + "." + field)
}
function GetDialogFieldValue(field) {
    var obj = GetDialogField(field);
    if (obj == null || obj == "")
        return "";
    return obj.value
}
function IsRadioButton(object) {
    if (document.getElementsByName(object.id + "_radio").length > 0)
        return true;
    else
        return false
}
function IsCheckBox(object) {
    if (document.getElementsByName(object.id + "_displayCheckBox").length > 0)
        return true;
    else
        return false
}
function GetRadioObject(object) {
    var radioObj = document.getElementsByName(object.id + "_radio")[0];
    return radioObj
}
function GetRadioCollection(object) {
    var radioColl = document.getElementsByName(object.id + "_radio");
    return radioColl
}
function setRadioValue(theObj, theObjValue) {
    for (var i = 0; i < theObj.length; i++)
        if (theObj[i].value == theObjValue)
            theObj[i].checked = true;
        else
            theObj[i].checked = false
}
function DisableRadioCollection(theObj) {
    for (var i = 0; i < theObj.length; i++)
        theObj[i].disabled = true
}
function EnableRadioCollection(theObj) {
    for (var i = 0; i < theObj.length; i++)
        theObj[i].disabled = false
}
function HideElement(element) {
    if (element) {
        element.style.visibility = "hidden";
        element.style.display = "none";
        element.className = element.className.replace("clsVisible", "clsInVisible");
        element.valueOf = ""
    }
}
function ShowElement(element, needEnable) {
    if (element) {
        element.style.visibility = "visible";
        element.style.display = "inline";
        element.className = element.className.replace("clsInVisible", "clsVisible");
        if (needEnable) {
            var controls, controlsCount = 0, elementToEnable = element;
            if (elementToEnable.tagName.toLowerCase() == "input" || elementToEnable.tagName.toLowerCase() == "select") {
                elementToEnable.style.backgroundColor = "";
                elementToEnable.className = elementToEnable.className.toString().replace("disabled", "");
                elementToEnable.removeAttribute("disabled")
            }
            controls = element.getElementsByTagName("input");
            for (var controlsCount = controls.length, index = 0; index < controlsCount; index++) {
                elementToEnable = controls[index];
                elementToEnable.className = elementToEnable.className.toString().replace("disabled", "");
                elementToEnable.style.backgroundColor = "";
                elementToEnable.removeAttribute("disabled")
            }
            controls = element.getElementsByTagName("select");
            controlsCount = controls.length;
            for (var index = 0; index < controlsCount; index++) {
                elementToEnable = controls[index];
                elementToEnable.className = elementToEnable.className.toString().replace("disabled", "");
                elementToEnable.style.backgroundColor = "";
                elementToEnable.removeAttribute("disabled")
            }
        }
    }
}
function GetAttribute(objHTMLElement, strAttribute) {
    var attribute = "";
    if (objHTMLElement.getAttribute(strAttribute) != null)
        attribute = objHTMLElement.getAttribute(strAttribute);
    return attribute
}
function GetCheckBoxObject(field) {
    var cbObj = GetObj(field.id + "_displayCheckBox");
    return cbObj
}
function IsCVAqarSbr20Experience() {
    var fld = GetObj("sbr20experience");
    if (fld != null && fld.value == "Y")
        return true;
    else
        return false
}
function IsDialogRendered() {
    var renderDialogId = GetHiddenVariable("renderDialog" + GetActiveDialog());
    if (GetObj(renderDialogId) != null)
        return true;
    else
        return false
}
function btnGetErrorsClick() {
    var dialogPreContinue = "DialogPreContinue" + GetActiveDialog();
    CallIfFunctionExists(dialogPreContinue);
    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(btnGetErrorsClickUpdatePanelEnd);
    ProcessOnPageErrorsServerEvent();
    return false
}
var g_EntityOverride = ""
  , g_dialogMode = "";
function ProcessOnPageErrorsServerEvent() {
    var dialogModeId = GetHiddenVariable("dialogModeId" + GetActiveDialog());
    g_dialogMode = GetObj(dialogModeId).value;
    g_EntityOverride = GetEntity();
    ShowFieldInfoInProgressWindow();
    GetObj(GetHiddenVariable("OnPageErrorsButtonId" + GetActiveDialog())).click();
    StopPropagationAndPreventDefault()
}
function btnGetErrorsClickUpdatePanelEnd() {
    Sys.WebForms.PageRequestManager.getInstance().remove_endRequest(btnGetErrorsClickUpdatePanelEnd);
    if (IsDialogRendered())
        if (GetObj(GetHiddenVariable("onpgEdts" + GetActiveDialog())).value == "0") {
            var dialogPostContinue = "DialogPostContinue" + GetActiveDialog();
            CloseDialog(GetActiveDialog());
            CallIfFunctionExists(dialogPostContinue);
            logEditCountEvent()
        } else {
            ShowDialogWithEntity(null, GetActiveDialog(), true, g_EntityOverride, g_dialogMode);
            g_dialogMode = ""
        }
}
function CancelFaoMenuEventBubble() {
    var faoMenuIndicator = GetObj(FaoMenuLoadedId);
    if (faoMenuIndicator)
        if (window.event != null) {
            if (window.event.cancelBubble !== undefined)
                window.event.cancelBubble = true;
            window.event.stopPropagation && window.event.stopPropagation()
        }
}
function CancelWindowCloseForFaoMenu() {
    var faoMenuIndicator = GetObj(FaoMenuLoadedId);
    faoMenuIndicator && SetCloseWindowIndicator(false)
}
function RunPipRiskAlgorithm(obj) {
    var obj = GetObj("pip_risk_dlg_ind");
    return obj != null && g_currentPage == "FinalSale"
}
function MaskedEditKeyDownHandler() {
    var scanCode = event.keyCode;
    if (Sys.Browser.agent == Sys.Browser.Webkit && (scanCode == 8 || scanCode == 46 || scanCode == 127)) {
        var ele = $get(event.srcElement.id)
          , maskedEdit = ele.MaskedEditBehavior;
        if (maskedEdit != undefined) {
            var ClearText, wrapper = ele.AjaxControlToolkitTextBoxWrapper;
            if (scanCode == BACKSPACE_KEY) {
                maskedEdit._SetCancelEvent(event);
                curpos = maskedEdit._deleteTextSelection();
                if (curpos != -1)
                    ele.setSelectionRange(curpos, curpos);
                else {
                    curpos = maskedEdit._getCurrentPosition();
                    maskedEdit._backspace(curpos);
                    curpos = maskedEdit._getPreviousPosition(curpos - 1);
                    ele.setSelectionRange(curpos, curpos)
                }
                maskedEdit._MessageValidatorTip && wrapper.get_Value() == maskedEdit._EmptyMask && maskedEdit.ShowTooltipMessage(true)
            } else if (scanCode == DELETE_KEY || scanCode == NUMBERPAD_DELETE_KEY) {
                maskedEdit._SetCancelEvent(event);
                curpos = maskedEdit._deleteTextSelection();
                if (curpos == -1) {
                    curpos = maskedEdit._getCurrentPosition();
                    if (!maskedEdit._isValidMaskedEditPosition(curpos))
                        if (curpos != maskedEdit._LogicLastInt && maskedEdit._InputDirection != AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
                            curpos = maskedEdit._getNextPosition(curpos);
                    maskedEdit._deleteAtPosition(curpos, false)
                } else if (maskedEdit._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft) {
                    ClearText = maskedEdit._getClearMask(wrapper.get_Value());
                    if (ClearText != "") {
                        ClearText = ClearText.replace(new RegExp("(\\" + maskedEdit.get_CultureThousandsPlaceholder() + ")","g"), "") + "";
                        if (ClearText.substring(ClearText.length - 1, ClearText.length) == maskedEdit.get_CultureDecimalPlaceholder()) {
                            ClearText = ClearText.substring(0, ClearText.length - 1);
                            maskedEdit.loadValue(ClearText, maskedEdit._LogicLastInt)
                        } else
                            maskedEdit.loadValue(ClearText, maskedEdit._LogicLastPos)
                    }
                }
                ele.setSelectionRange(curpos, curpos);
                maskedEdit._MessageValidatorTip && wrapper.get_Value() == this._EmptyMask && maskedEdit.ShowTooltipMessage(true)
            }
        }
    }
}
function MaskedEditOnFocus() {
    if (Sys.Browser.agent == Sys.Browser.Webkit) {
        var ele = $get(event.srcElement.id)
          , maskedEdit = ele.MaskedEditBehavior;
        if (maskedEdit != undefined)
            if (maskedEdit._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
                if (maskedEdit._LogicLastInt != -1)
                    setSelectionRange(maskedEdit._LogicLastInt, tmaskedEdithis._LogicLastInt);
                else
                    setSelectionRange(maskedEdit._LogicLastPos + 1, maskedEdit._LogicLastPos + 1);
            else if (maskedEdit._MaskType == AjaxControlToolkit.MaskedEditType.Number && ClearText != "") {
                var pos = maskedEdit._getLastEmptyPosition() + 1;
                setSelectionRange(pos, pos)
            } else
                setSelectionRange(maskedEdit._LogicFirstPos, maskedEdit._LogicFirstPos)
    }
}
function setSelectionRange(selectionStart, selectionEnd) {
    input = $get(event.srcElement.id);
    setTimeout(function() {
        input.setSelectionRange(selectionStart, selectionEnd)
    }, 0)
}
function ProcessKey() {
    var scanCode = event.keyCode
      , ele = $get(event.srcElement.id)
      , regex = new RegExp(ele.getAttribute("regex"),"i");
    return regex.test(String.fromCharCode(scanCode))
}
function FormatInput(spec, mask, value) {
    if (value != "")
        return Format(spec, mask, value);
    return value
}
function FormatInputTime(spec, mask, value) {
    if (value == "")
        return value;
    var ampm = " AM";
    if (value.toLowerCase().indexOf("p") > -1)
        ampm = " PM";
    var retVal = Format(spec, mask, value);
    return retVal + ampm
}
function CheckForEmptyLists(entityIndex) {
    var objSlWebMsg = GetObj("VEH." + entityIndex + ".sl_webservice_error_msg");
    if (objSlWebMsg != null && objSlWebMsg.value.length > 0) {
        alert(objSlWebMsg.value);
        objSlWebMsg.value = ""
    }
}
function DisallowBlankOption(obj) {
    if (obj.selectedIndex == 0 && obj.value == "" && obj.getAttribute("AllowBlankOption") == "false") {
        var evt = window.event || arguments.callee.caller.arguments[0];
        if (GetObjValue("mobiledevice_ind") === "Y")
            obj.value = obj.getAttribute("prevVal");
        else if ((typeof obj.getAttribute("prevVal") != "undefined" || obj.getAttribute("prevVal") == "") && typeof obj.options != "undefined" && obj.options.length > 1 && (evt.keyCode == g_keyDownArrow || evt.keyCode == g_keyUpArrow || evt.type == "change")) {
            obj.value = obj.options[1].value;
            obj.setAttribute("prevVal", obj.value)
        } else if (evt.keyCode == g_keyDownArrow || evt.keyCode == g_keyUpArrow || evt.type == "change")
            obj.value = obj.getAttribute("prevVal")
    } else
        obj.setAttribute("prevVal", obj.value)
}
function SetExtraWidth(tbl) {
    if (typeof tbl.attr("WidthCslField") != "undefined") {
        var id = tbl.attr("WidthCslField").replace(/\./g, "\\.");
        $("#" + id).attr("class", tbl.attr("WidthCslClass") + " " + $("#" + id).attr("class"));
        if ($("#" + id).first().find("div").length > 1) {
            var secDiv = $("#" + id).first().find("div:nth-child(2)")
              , secDivCls = secDiv.attr("class").replace(/rvQCov /g, "");
            secDiv.attr("class", tbl.attr("WidthCslClass") + " " + secDivCls)
        }
    }
}
$(document).ready(function() {
    HandleTabs()
});
function HandleTabs() {
    try {
        $("table[handletabs]").each(function() {
            SetExtraWidth($(this));
            var rowIdx = 0
              , colIdx = 0
              , iRows = 0
              , iCols = 0;
            iRows = $(this)[0].rows.length;
            iCols = $(this)[0].rows[0].cells.length;
            $(this).find("tr").each(function(rId) {
                rowIdx = rId;
                $(this).find("td").each(function(cId) {
                    colIdx = cId;
                    $(this).find("input, select").each(function() {
                        var rIdTmp = rowIdx
                          , cIdTmp = colIdx
                          , iRwsTmp = iRows
                          , iClsTmp = iCols;
                        if (GetObjValue("mobiledevice_ind") === "Y") {
                            $(this).attr("tabindex", (colIdx - 1) * iRows + (rowIdx + 1));
                            return
                        }
                        $(this).off("keydown").on("keydown", function(e) {
                            var code = e.keyCode ? e.keyCode : e.which;
                            if (code == 9) {
                                var rId = rIdTmp
                                  , cId = cIdTmp
                                  , iRws = iRwsTmp
                                  , iCls = iClsTmp;
                                if (!e.shiftKey)
                                    FindNextActiveInput(e, rId, cId, iRws, iCls);
                                else
                                    FindPrevActiveInput(e, rId, cId, iRws, iCls)
                            }
                        })
                    })
                })
            })
        })
    } catch (e) {}
}
function FindNextActiveInput(evt, r, c, rows, cols) {
    try {
        if (r >= rows - 1) {
            if (c < cols - 1) {
                FindNextActiveInput(evt, -1, c + 1, rows, cols);
                evt.preventDefault();
                return false
            }
            return
        }
        if (r < rows - 1) {
            if (r != -1) {
                var tgtSrcFromCurrentCol = $($(evt.target).closest("table")[0].rows[r].cells[c]).find("input:visible, select:visible");
                if (tgtSrcFromCurrentCol != "undefined" && tgtSrcFromCurrentCol.length > 1)
                    for (var ic = 0; ic < tgtSrcFromCurrentCol.length - 1; ic++)
                        if ($(tgtSrcFromCurrentCol[ic]).is(evt.target) && ic <= tgtSrcFromCurrentCol.length - 2) {
                            tgtSrcFromCurrentCol[ic + 1].focus();
                            evt.preventDefault();
                            return false
                        }
            }
            var tgtSrcFromNextCol = $($(evt.target).closest("table")[0].rows[r + 1].cells[c]).find("input:visible, select:visible");
            if (tgtSrcFromNextCol.length === 0 || tgtSrcFromNextCol.is(":disabled"))
                FindNextActiveInput(evt, r + 1, c, rows, cols);
            else {
                tgtSrcFromNextCol[0].focus();
                evt.preventDefault();
                return false
            }
        }
    } catch (e) {}
}
function FindPrevActiveInput(evt, r, c, rows, cols) {
    try {
        if (r <= 0) {
            if (c > 1) {
                FindPrevActiveInput(evt, rows, c - 1, rows, cols);
                evt.preventDefault();
                return false
            }
            return false
        }
        if (r > 0) {
            var tgtSrcFromPrevCol = $($(evt.target).closest("table")[0].rows[r - 1].cells[c]).find("input:visible, select:visible");
            if (tgtSrcFromPrevCol.length === 0 || tgtSrcFromPrevCol.is(":disabled"))
                FindPrevActiveInput(evt, r - 1, c, rows, cols);
            else {
                var tgtSrcFromCurrentCol = $($(evt.target).closest("table")[0].rows[r].cells[c]).find("input:visible, select:visible");
                if (HandlePrevForMultiInputs(evt, tgtSrcFromCurrentCol, false) || HandlePrevForMultiInputs(evt, tgtSrcFromPrevCol, true))
                    return false;
                tgtSrcFromPrevCol[0].focus();
                evt.preventDefault();
                return false
            }
        }
    } catch (e) {}
}
function HandlePrevForMultiInputs(evt, multiColtrolList, defaultToLast) {
    try {
        if (multiColtrolList != "undefined" && multiColtrolList.length > 1) {
            for (var ic = multiColtrolList.length - 1; ic > 0; ic--)
                if ($(multiColtrolList[ic]).is(evt.target) && ic >= 1) {
                    multiColtrolList[ic - 1].focus();
                    evt.preventDefault();
                    return true
                }
            if (defaultToLast) {
                multiColtrolList[multiColtrolList.length - 1].focus();
                evt.preventDefault();
                return true
            }
        }
        return false
    } catch (e) {
        return false
    }
}
function SetBodyHeightToContentHeight() {
    document.body.style.height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) + "px"
}
function StopPropagation() {
    var event = event || window.event;
    if (typeof event.stopPropagation != "undefined")
        event.stopPropagation();
    else
        event.cancelBubble = true
}
function PreventDefault() {
    var event = event || window.event;
    if (typeof event.preventDefault != "undefined")
        event.preventDefault();
    else
        event.returnValue = false
}
function StopPropagationAndPreventDefault() {
    StopPropagation();
    PreventDefault()
}
function isPdfMimeTypeSupported() {
    if (navigator.mimeTypes != null && navigator.mimeTypes.length > 0)
        for (i = 0; i < navigator.mimeTypes.length; i++) {
            var mtype = navigator.mimeTypes[i];
            if (mtype.type == "application/pdf" && mtype.enabledPlugin)
                return true
        }
    if (navigator.appVersion.indexOf("Edge/") > -1)
        return true;
    return false
}
function handleNumericInput(event) {
    var keyCode = getKeyCode(event);
    if (keyCode >= 48 && keyCode <= 57)
        return true;
    else {
        StopEvent(event);
        return false
    }
}
function getKeyCode(event) {
    event = event || window.event;
    return event.charCode || event.keyCode
}
function StopEvent(event) {
    if (!event)
        if (window.event)
            event = window.event;
        else
            return;
    if (event.cancelBubble != null)
        event.cancelBubble = true;
    event.stopPropagation && event.stopPropagation();
    event.preventDefault && event.preventDefault();
    if (window.event)
        event.returnValue = false;
    if (event.cancel != null)
        event.cancel = true
}
function EntityCancel() {
    if (g_vehCount > 1 && g_currentPage == "C2VehicleSummary")
        --g_vehCount;
    if (g_drvrCount > 1 && g_currentPage == "C2DriverSummary")
        --g_drvrCount
}
function logEditCountEvent() {
    CallIfFunctionExists("logEditCountEventGA")
}
function bindLinkClickOnContainer(arg) {
    typeof bindLinkClickOnContainerGA == "function" && bindLinkClickOnContainerGA(arg)
}
(function(history) {
    var pushState = history.pushState;
    history.pushState = function() {
        historyChanged = true;
        return pushState.apply(history, arguments)
    }
}
)(window.history);
function RecalcRatesGA() {
    CallIfFunctionExists("RecalcRatesEventGA")
}
$(function() {
    $("#pol_eff_dt").on("blur", function() {
        validateEffDt($(this))
    })
});
$(function() {
    $("#sbr_confirm_poleffdt").on("blur", function() {
        validateEffDt($(this))
    })
});
function validateEffDt(dt) {
    if (typeof maxBackDate != "undefined" && typeof invalidEffectiveDateMsg != "undefined") {
        var msDay = 8.64e7;
        enteredDate = new Date(dt.val());
        today = new Date;
        if (Math.ceil((enteredDate - today) / msDay) + parseInt(maxBackDate) < 0) {
            alert(invalidEffectiveDateMsg);
            dt.val("").focus()
        }
    }
}
var faoUrlId;
function RedirectToFaoHome() {
    var faoUrl = GetObj(faoUrlId).value
      , parent = window.opener;
    if (parent)
        if (parent.closed) {
            var newWin = window.open(faoUrl);
            newWin.opener = null;
            window.opener = newWin;
            newWin.focus()
        } else {
            parent.location = faoUrl;
            parent.focus()
        }
    else {
        CancelWindowCloseForFaoMenu();
        window.location = faoUrl
    }
}
var linkValueId, navigateLinksId, contextIndex, saveAsId;
function NavigateLinks(value, sourceObj) {
    DisableAll();
    switch (value) {
    case "SaveOnUnload":
    case "SaveLink":
        CleanupApplication(value);
        break;
    case "MvpExport":
        ShowPopupCenterWindow(sourceObj, "Admin/SaveXmlData.aspx?view=mvpexport", "_viewMvpExport", 500, 500, "resizable=yes");
        EnableAll();
        break;
    case "MvpImport":
        ShowPopupCenterWindow(sourceObj, "Admin/ImportMvpFile.aspx", "_importMvp", 500, 150, "resizable=no");
        EnableAll();
        break;
    case "CancelOnUnload":
        CleanupApplication(value, false);
        break;
    case "OpenPolicySummary":
        ShowPopupCenterWindow(sourceObj, "PolicySummary.aspx", "_openPolicySummary_" + contextIndex, 500, 600, "resizable=no, scrollbars=yes");
        EnableAll();
        break;
    default:
        GetObj(linkValueId).value = value;
        GetObj(navigateLinksId).click()
    }
}
function Cancelclick() {
    confirm("Are you sure you want to cancel?") && NavigateLinks("CancelOnUnload")
}
function PerformSaveAs() {
    var saveObj = GetObj(saveAsId);
    if (saveObj)
        saveObj.value = "Y"
}
var menuItemValueId, navigateMenuId;
function NavigateMenu(value) {
    GetObj(menuItemValueId).value = value;
    PostScreenNotEval() && MenuNavigateToPage()
}
function MenuNavigateToPage() {
    DisableAll();
    GetObj(navigateMenuId).click()
}
function PostScreenNotEval() {
    if (eval("typeof(PostScreen)") == "function")
        return eval(PostScreen(navigateMenuId));
    return true
}
var mainMenuId, crossSellMenuId;
function ToggleMenuControl(disabled) {
    var obj = GetObj(mainMenuId);
    if (obj != null)
        obj.disabled = disabled;
    obj = GetObj(crossSellMenuId);
    if (obj != null)
        obj.disabled = disabled
}
function DisableMenuControl() {
    ToggleMenuControl(true)
}
function EnableMenuControl() {
    ToggleMenuControl(false)
}
var faoUrl;
function RedirectUrl(obj) {
    CancelFaoMenuEventBubble();
    var destUrl = faoUrl + obj.getAttribute("urlDestination")
      , win = window.open(destUrl, "footer", "toolbars=no, status=yes,resizable=yes,scrollbars=yes, width=792, height=528, top=0, left=0");
    win.focus()
}
var Action, homeWin, waitID, rtnToCaller = false, KeepAQAROpen = false, transactionComplete = false, PHAAgentQuoteHasTeaserRateWithHomeOwner;
function HomeownerClick() {
    GetObjValue("mobiledevice_ind") == "Y" && alert("This feature/product has not been optimized for mobile devices. You may encounter issues if you continue.");
    if (ShouldStartNewPhaQuote())
        ShowDialog(null, "DwellingInfo", true);
    else
        RedirectToHomeownerPortal("QuoteSummary")
}
function ShouldStartNewPhaQuote() {
    return (!HasHpQuoteId() || PHAAgentQuoteHasTeaserRateWithHomeOwner) && !IsPlatinumQuote()
}
function DialogPreContinueDwellingInfo() {
    g_currentPage != "Errors" && Sys.WebForms.PageRequestManager.getInstance().add_endRequest(PostDialogContinue)
}
function PostDialogContinue() {
    Sys.WebForms.PageRequestManager.getInstance().remove_endRequest(PostDialogContinue);
    RedirectToHomeownerPortal("QuoteSummary")
}
function IsPlatinumQuote() {
    var quoteId = GetObjValue("pol_platinum_quote_id");
    return quoteId != ""
}
function HasHpQuoteId() {
    var quoteId = GetObjValue("HomeownerPortal.0.hp_quote_id");
    return quoteId != ""
}
function OkToCallAuthenticate() {
    return HasHpQuoteId() || GetObjValue("calling_app") == "FAOServicing" || IsPlatinumQuote()
}
function RedirectToHomeownerPortal(act, rtrn) {
    DisableAll();
    if (rtrn != "undefined")
        rtnToCaller = rtrn;
    else
        rtnToCaller = false;
    if (OkToCallAuthenticate())
        try {
            Action = act;
            Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.Authenticate(GetQueryStringArgs().applicationContextIndex, GetqueryStringValue("syncId"), ProcessSignon, HomeownerPortalError)
        } catch (e) {
            EnableAll();
            alert(e.message);
            GetObj(HomeownerHiddenUpdateBtn).click()
        }
    else {
        EnableAll();
        GetObj(HomeownerHiddenUpdateBtn).click()
    }
}
function ShouldKeepAqarOpen() {
    if (IsPlatinumQuote())
        return false;
    else
        return true
}
function ProcessSignon(result) {
    SetRedirectFailureInd("N");
    SetShowPopupBlockerMsg("N");
    if (result == "SessionExpired")
        window.location = "SessionExpired.htm";
    else {
        var rsp;
        KeepAQAROpen = ShouldKeepAqarOpen();
        try {
            rsp = new ActiveXObject("Microsoft.XMLDOM");
            if (rsp != null) {
                rsp.async = false;
                rsp.preserveWhiteSpace = true;
                rsp.loadXML(result)
            } else
                rsp = (new DOMParser).parseFromString(result, "text/xml")
        } catch (exc) {
            rsp = (new DOMParser).parseFromString(result, "text/xml")
        }
        var homeUrl, hmToken, hmAgtCd, hmQtNm, hmPolNm, hmPolNmSfx, authErr = "Homeowner Portal Authentication Failure", partnerErr = "PHA quote is no longer valid because you now write with a new PHA underwriting company.  Please cross sell this customer for a new PHA quote.";
        if (rsp) {
            var rv = rsp.documentElement.selectSingleNode("//Status");
            if (rv)
                if (GetNodeTextFromNode(rv) == "Success") {
                    homeUrl = rsp.documentElement.selectSingleNode("//URL");
                    hmToken = rsp.documentElement.selectSingleNode("//Token");
                    hmAgtCd = rsp.documentElement.selectSingleNode("//AgentCode");
                    hmQtNm = rsp.documentElement.selectSingleNode("//QuoteID");
                    hmPolNm = rsp.documentElement.selectSingleNode("//ProgressivePolicyNumber");
                    hmPolNmSfx = rsp.documentElement.selectSingleNode("//ProgressivePolicyNumberSuffix")
                } else if (GetNodeTextFromNode(rv) == "PartnerFailed") {
                    EnableAll();
                    alert(partnerErr);
                    return RedirectFailure()
                } else {
                    EnableAll();
                    alert(authErr);
                    return RedirectFailure()
                }
            else {
                EnableAll();
                alert(authErr);
                return RedirectFailure()
            }
        } else {
            EnableAll();
            alert(authErr);
            return RedirectFailure()
        }
    }
    var hpQuoteMsg = GetObj("HomeownerPortal.0.hp_quote_msg");
    try {
        homeWin = window.open("", "_blank", "top=0,left=0,height=600,width=800,status=yes,resizable=yes,scrollbars=yes");
        if (homeWin == null) {
            EnableAll();
            if (hpQuoteMsg)
                hpQuoteMsg.innerText = "You may be receiving this message due to a Pop-up blocker.  To avoid this in the future, please add ForAgentsOnly.com to your exclusion list.";
            SetShowPopupBlockerMsg("Y");
            SetPopupBlockerInd(true);
            return RedirectFailure()
        }
        homeWin.document.write("<div style='display:none;'>");
        homeWin.document.write("<form name='cSize' method='post' action='" + GetNodeTextFromNode(homeUrl) + "' ID='cSize'>");
        homeWin.document.write("<input NAME='Token' value='" + GetNodeTextFromNode(hmToken) + "'><br>");
        homeWin.document.write("<input NAME='Action' value='" + Action + "'><br>");
        homeWin.document.write("<input NAME='Agent' value='" + GetNodeTextFromNode(hmAgtCd) + "'><br>");
        homeWin.document.write("<input NAME='HomeQuoteNbr' value='" + GetNodeTextFromNode(hmQtNm) + "'><br>");
        homeWin.document.write("<input NAME='ProgPolNbr' value='" + GetNodeTextFromNode(hmPolNm) + "'><br>");
        homeWin.document.write("<input NAME='ProgPolSfx' value='" + GetNodeTextFromNode(hmPolNmSfx) + "'><br>");
        homeWin.document.write("</form>");
        homeWin.document.write("</div>");
        homeWin.document.cSize.submit()
    } catch (e) {
        EnableAll();
        if (hpQuoteMsg)
            hpQuoteMsg.innerText = "You may be receiving this message due to a Pop-up blocker.  To avoid this in the future, please add ForAgentsOnly.com to your exclusion list.";
        SetShowPopupBlockerMsg("Y");
        SetPopupBlockerInd(true);
        return RedirectFailure()
    }
    waitID = setInterval("ReturnFromHomeownerPortal()", 500);
    AddDOMEvent("onfocus", FocusOnHomeownerPortal);
    IsPlatinumQuote() && CleanupApplication("SaveLink");
    return true
}
function HomeownerPortalError(result) {
    EnableAll();
    alert("Error: " + result.get_message())
}
function FocusOnHomeownerPortal() {
    try {
        if (homeWin && !homeWin.closed)
            homeWin.focus();
        else
            DetachDOMEvent("onfocus", FocusOnHomeownerPortal)
    } catch (e) {
        DetachDOMEvent("onfocus", FocusOnHomeownerPortal)
    }
}
function ReturnFromHomeownerPortal() {
    try {
        if (homeWin.closed) {
            clearInterval(waitID);
            if (ShouldRunUpdatePolicyInfoTransaction())
                RunUpdatePolicyInfoTransaction(true);
            else
                rtnToCaller && ReturnToCaller()
        }
    } catch (e) {
        EnableAll();
        var close = e
    }
}
function RunUpdatePolicyInfoTransaction(useCallBack) {
    try {
        if (useCallBack)
            Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.UpdatePolicyInfo(GetQueryStringArgs().applicationContextIndex, GetqueryStringValue("syncId"), ProcessUpdatePolicyInfoTransaction, HomeownerPortalError);
        else {
            Progressive.Agent.Quoting.Web.Aqar.FieldInfoService.UpdatePolicyInfo(GetQueryStringArgs().applicationContextIndex, GetqueryStringValue("syncId"), null, null);
            EnableAll()
        }
    } catch (e) {
        EnableAll();
        alert(e.message)
    }
}
function ProcessUpdatePolicyInfoTransaction(result) {
    if (rtnToCaller)
        ReturnToCaller();
    else {
        try {
            var rspDoc = LoadXMLDoc(result)
              , status = GetNodeTextFromNode(rspDoc.documentElement.selectSingleNode("//Status"))
              , hmQtNm = GetNodeTextFromNode(rspDoc.documentElement.selectSingleNode("//QuoteID"));
            GetObj("HomeownerPortal.0.hp_partner_qt_stat").value = status;
            GetObj("HomeownerPortal.0.hp_quote_id").value = hmQtNm;
            GetObj(HomeownerHiddenUpdateBtn).click()
        } catch (e) {
            EnableAll();
            return false
        }
        EnableAll()
    }
    return true
}
function BeforeClosingAQAR() {
    if (KeepAQAROpen && homeWin && !homeWin.closed)
        if (GetObjValue("calling_app") == "")
            event.returnValue = "The auto quote must be kept open while quoting Homeowners.";
        else
            event.returnValue = "ForAgentsOnly.com must be kept open while processing Homeowners."
}
function CloseHomeownerPortal() {
    if (KeepAQAROpen && homeWin && !homeWin.closed) {
        if (ShouldRunUpdatePolicyInfoTransaction()) {
            var applicationIndex = GetQueryStringArgs().applicationContextIndex
              , syncId = GetqueryStringValue("syncId");
            SynchronousCall("UpdatePolicyInfo", '{"applicationContextIndex":"' + applicationIndex + '","syncId":"' + syncId + '"}', "An error occurred updating policy information.")
        }
        homeWin.close();
        EnableAll()
    }
}
function RegisterHpUnloadEvents() {
    var prevOnBeforeUnload = window.onbeforeunload
      , prevOnUnload = window.onunload;
    window.onbeforeunload = function() {
        BeforeClosingAQAR();
        prevOnBeforeUnload()
    }
    ;
    window.onunload = function() {
        CloseHomeownerPortal();
        prevOnUnload()
    }
}
function SetHpConfigPageInd() {
    GetObj("HomeownerPortal.0.hp_config_is_visited").value = "Y";
    GetObj(HpConfigHiddenUpdateBtn).click()
}
function RedirectFailure() {
    var redirectFailureInd = GetObj("HomeownerPortal.0.hp_redirect_failure_ind");
    if (redirectFailureInd != null) {
        redirectFailureInd.value = "Y";
        GetObj(HomeownerHiddenUpdateBtn).click()
    }
    return false
}
function SetRedirectFailureInd(val) {
    var redirectFailureInd = GetObj("HomeownerPortal.0.hp_redirect_failure_ind");
    if (redirectFailureInd != null)
        redirectFailureInd.value = val
}
function SetShowPopupBlockerMsg(val) {
    var showPopupBlockerMsg = GetObj("HomeownerPortal.0.hp_show_popup_blocker_msg");
    if (showPopupBlockerMsg != null)
        showPopupBlockerMsg.value = val
}
function ShouldRunUpdatePolicyInfoTransaction() {
    if (GetObj("HomeownerPortal.0.hp_quote_id").value == "" || GetObj("HomeownerPortal.0.hp_partner_qt_stat").value == "Sold")
        return false;
    return true
}
function ExceedMaxRows(_this, s, maxCols, maxRows) {
    for (var rowCt = 1, linePos = 0, i = 0; i < s.length; i++) {
        var currChar = s.charAt(i);
        if (currChar == "\r") {
            if (s.charAt(i + 1) == "\n")
                ++i;
            ++rowCt;
            linePos = 0
        } else {
            ++linePos;
            if (linePos > maxCols) {
                ++rowCt;
                linePos = 1;
                prevChar = s.charAt(i - 1);
                if (prevChar != "\n" && prevChar != " " && prevChar != "\r") {
                    for (var foundSpace = false, j = 2; j <= maxCols; j++)
                        if (s.charAt(i - j) == " ") {
                            foundSpace = true;
                            break
                        }
                    if (foundSpace)
                        linePos = j
                }
            }
        }
        if (rowCt > maxRows) {
            if (i != s.length - 1) {
                var msg = "The maximum number of lines for this text is " + maxRows + " lines.";
                msg += "\nText will be trimmed";
                _this.value = s.substr(0, i);
                alert(msg)
            }
            return true
        }
    }
    return false
}
function InitTextareaFlds(_this, maxlen, allowReturns, maxRows) {
    if (!_this.initialized) {
        _this.initialized = true;
        _this.maxlen = maxlen;
        _this.allowReturns = allowReturns;
        _this.maxRows = maxRows
    }
}
function getMaxLength(_this, _maxLength) {
    if (!_maxLength)
        return _this.maxlen;
    return _maxLength
}
function getMaxRows(_this, _maxRows) {
    if (!_maxRows)
        return _this.maxRows;
    return _maxRows
}
function textareaSize(_this, _maxLength, _maxRows) {
    StopPropagation();
    _maxLength = getMaxLength(_this, _maxLength);
    _maxRows = getMaxRows(_this, _maxRows);
    var asciicode = window.event.keyCode;
    if (!_this.allowReturns && asciicode == g_keyEnter)
        return false;
    if (asciicode <= 31 && asciicode != g_keyEnter)
        return true;
    if (_maxRows != 0) {
        var wrkString = _this.value + String.fromCharCode(asciicode);
        if (ExceedMaxRows(_this, wrkString, _this.cols, _maxRows, false))
            return false
    }
    if (_maxLength != 0 && _this.value.length >= _maxLength) {
        alert("Cannot exceed maximum length of " + _maxLength + " characters.");
        return false
    }
    return true
}
function onBlurTextarea(_this) {
    for (var newValue = "", i = 0; i < _this.value.length; i++) {
        var currChar = _this.value.charAt(i);
        if (!_this.allowReturns) {
            if (currChar == "\n")
                newValue += " ";
            else if (currChar != "\r")
                newValue += currChar
        } else
            newValue += currChar
    }
    _this.value = newValue;
    _this.maxRows != 0 && ExceedMaxRows(_this, _this.value, _this.cols, _this.maxRows, true);
    if (_this.maxlen != 0 && _this.value.length > _this.maxlen) {
        alert("Cannot exceed maximum length of " + _this.maxlen + " characters. Text will be trimmed.");
        _this.value = _this.value.substr(0, _this.maxlen)
    }
    return true
}
if (typeof (Sys) !== 'undefined')
    Sys.Application.notifyScriptLoaded();
