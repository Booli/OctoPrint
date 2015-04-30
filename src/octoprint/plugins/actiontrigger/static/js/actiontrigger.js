$(function() {
  function ActionTriggerViewModel(parameters) {
    var self = this;

    self.loginState = parameters[0];
    self.printerState = parameters[1];
    self.control = parameters[2];
    self.settingsViewModel = parameters[3];

    self.actionTriggerTemplate = ko.observable(undefined);
    self.heatersOff = ko.observable(undefined);

    self.timer = ko.observable(0);
    self.minutes = ko.computed( function() {
      var minute = Math.floor(self.timer() / 60) % 60;
      return (minute < 10) ? "0" + minute : minute;
    }, self);
    self.seconds = ko.computed( function() {
      var second = self.timer() % 60;
      return (second < 10) ? "0"+second : second;
    }, self);


    self.showActionTriggerDialog = function (data) {
      var actionTriggerDialog = $("#action_trigger_dialog");
      var actionTriggerDialogAck = $(".action_trigger_dialog_acknowledge", actionTriggerDialog);

      $(".action_trigger_title", actionTriggerDialog).text(data.title);
      $(".action_trigger_dialog_message", actionTriggerDialog).text(data.message);
      actionTriggerDialogAck.unbind("click");
      actionTriggerDialogAck.bind("click", function (e) {
        e.preventDefault();
        $("#action_trigger_dialog").modal("hide");
        if(self.actionTriggerTemplate() == "door_open"){
          self.showControls();
        }
        if (self.actionTriggerTemplate() == "filament"){
          self.sendApi("cancel_timer");
          self.showControls();
        }
        //prob going to do some stuff here huh.
      });
      actionTriggerDialog.modal({
        show: 'true',
        backdrop:'static',
        keyboard: false
      });
    };

    self.onBeforeBinding = function() {
      self.settings = self.settingsViewModel.settings;
    };

    self.showControls = function() {
      $('#tabs a[href="#control"]').tab('show')
    };

    self.onDataUpdaterPluginMessage = function (plugin, data) {
      if (plugin != "actiontrigger") {
        return;
      };

      var messageType = data.type;
      var messageData = data.data;

      // Process action_trigger call from plugin
      switch (messageType) {
        case "filament":
          messageData.title = "Attention! Filament stop detected!";
          self.actionTriggerTemplate(messageType);
          self.showActionTriggerDialog(messageData);
          self.heatersOff(false);
          break;
        case "update_timer":
          self.timer(messageData.timer);
          if (messageData.timer == 0) {
            self.heatersOff(true);
          }
          break;
        case "door_open":
          messageData.title = "Attention! Door is open!";
          self.actionTriggerTemplate(messageType);
          self.showActionTriggerDialog(messageData);
          break;
        case "close_dialog":
          $("#action_trigger_dialog").modal("hide");
          break;
        case "bed_heating":
          messageData.title = "Heating bed, please close the door!";
          self.actionTriggerTemplate(messageType);
          self.showActionTriggerDialog(messageData);
          break;
        //Do nothing
      };
    };

    self.sendApi = function(command) {
      $.ajax({
          url: API_BASEURL + "plugin/actiontrigger",
          type: "POST",
          dataType: "json",
          contentType: "application/json; charset=UTF-8",
          data: JSON.stringify({command: command})
      });
    };

  };
  ADDITIONAL_VIEWMODELS.push([ActionTriggerViewModel, ["loginStateViewModel", "printerStateViewModel", "controlViewModel", "settingsViewModel"], document.getElementById("action_trigger_dialog")]);
});
