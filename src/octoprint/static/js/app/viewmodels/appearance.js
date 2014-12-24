function AppearanceViewModel(settingsViewModel, printerStateViewModel) {
    var self = this;

    self.name = settingsViewModel.appearance_name;
    self.color = settingsViewModel.appearance_color;

    self.brand = ko.computed(function() {
        if (self.name())
            return gettext("LilyPrint") + ": " + self.name();
        else
            return gettext("LilyPrint");
    });

    self.title = ko.computed(function() {
        if (self.name())
            return self.name() + " [" + gettext("LilyPrint") + "]";
        else
            return gettext("LilyPrint");
    });
}
