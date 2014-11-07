function ZOffsetViewModel(settingsViewModel, controlViewModel) {
    var self = this;

    self.settings = settingsViewModel;
    self.control = controlViewModel;

    self.calibration_zOffset = ko.observable(undefined);

    self.onStartup = function() {
        self.calibration_zOffset(self.settings.printer_zOffset());
    };
}
