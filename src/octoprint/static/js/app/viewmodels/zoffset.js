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

    self.startZcalibration = function() {
        self.control.sendHomeCommand('x');  
        self.control.sendHomeCommand('z');
        self.startedCalibration(true);

        self.control.sendJogCommand('z', 1, self.calibration_zOffset());
    };

    self.saveCalibration = function() {
        self.settings.printer_zOffset(self.calibration_zOffset());
        self.settings.saveData();
        $("#zOffset_dialog").modal("hide");
    };


}
