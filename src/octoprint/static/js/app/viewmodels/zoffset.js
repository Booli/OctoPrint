function ZOffsetViewModel(settingsViewModel, controlViewModel, loginStateViewModel) {
    var self = this;

    self.settings = settingsViewModel;
    self.control = controlViewModel;
    self.loginState = loginStateViewModel;

    self.calibration_zOffset = ko.observable(undefined);
    self.startedCalibration = ko.observable();

    self.onDialogShown = function() {
        self.settings.requestData();
        self.calibration_zOffset((self.settings.printer_zOffset()*1000 - 1000*1)/1000);
        self.startedCalibration(false);
    };


    self.increaseZ = function(distance) {
        self.control.sendJogCommand('z', 1, distance);
        self.calibration_zOffset((self.calibration_zOffset()*1000 + distance*1000)/1000);

    };

    self.decreaseZ = function(distance) {
        self.control.sendJogCommand('z', -1, distance);
        self.calibration_zOffset((self.calibration_zOffset()*1000 - distance*1000)/1000);

    };

    self.startZCalibration = function() {

      var commands = [
        "G28 X0",
        "G28 Y0",
        "G1 Y110",
        "G28 Z0",
        "G91",
        "G1 Z-" + self.calibration_zOffset() +" F200",
        "G90"
      ];

      $.ajax({
        url: API_BASEURL + "printer/command",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=UTF-8",
        data: JSON.stringify({"commands": commands}),
        success: function() {
          self.startedCalibration(true);
        }
      });
    };

    self.saveCalibration = function() {
        self.settings.printer_zOffset(self.calibration_zOffset());
        self.settings.saveData();
        $("#zOffset_dialog").modal("hide");
    };


}
