function AppearanceViewModel(settingsViewModel) {
    var self = this;

    self.name = settingsViewModel.appearance_name;
    self.color = settingsViewModel.appearance_color;

    self.brand = ko.computed(function() {
        if (self.name())
            return "LilyPrint: " + self.name();
        else
            return "LilyPrint";
    })

    self.title = ko.computed(function() {
        if (self.name())
            return self.name() + " [LilyPrint]";
        else
            return "LilyPrint";
    })
}
