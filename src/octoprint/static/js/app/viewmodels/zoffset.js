function ZOffsetViewModel(settingsViewModel, controlViewModel, loginStateViewModel) {
    var self = this;

    self.settings = settingsViewModel;
    self.control = controlViewModel;
    self.loginState = loginStateViewModel;

    self.calibration_zOffset = ko.observable(undefined);
    self.startedCalibration = ko.observable();

    self.onDialogShown = function() {
        self.calibration_zOffset(self.settings.printer_zOffset());
        self.startedCalibration(false);
    };


    self.increaseZ = function(distance) {
        self.control.sendJogCommand('z', 1, distance);
        self.calibration_zOffset(self.calibration_zOffset() + distance);
    };

    self.decreaseZ = function(distance) {
        self.control.sendJogCommand('z', -1, distance);
        self.calibration_zOffset(self.calibration_zOffset() - distance);

    };

    self.startZcalibration = function() {
        self.control.sendHomeCommand('z');
        self.startedCalibration(true);

        var old_zOffset = self.calibration_zOffset();
        var calibration_z = old_zOffset - 1;

        self.control.sendJogCommand('z', 1, calibration_z);


    };

    self.saveCalibration = function() {
        self.settings.printer_zOffset(self.calibration_zOffset());
        self.settings.saveData();
    };

}
