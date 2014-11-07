function ZOffsetViewModel(settingsViewModel, controlViewModel) {
    var self = this;

    self.settings = settingsViewModel;
    self.control = controlViewModel;

    self.calibrationZOffset = ko.observable(undefined);

    self.calibrationZOffset = self.settings.printer_zOffset();

    self.startZOffset = function() {
        $("#zOffset_dialog").modal("show");
            var old_zOffset = self.settings.printer_zOffset();
            calibrationZOffset = old_z0ffset - 0.5;

            self.control.sendHomeCommand(z);
            self.control.sendJogCommand(z, 1, calibrationZ);

    };

}
