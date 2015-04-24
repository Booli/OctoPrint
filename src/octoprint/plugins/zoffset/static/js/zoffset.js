$(function() {
    function ZOffsetViewModel(parameters) {
        var self = this;

        self.settings = parameters[0];
        self.control = parameters[1];
        self.loginState = parameters[2];

        self.calibration_zOffset = ko.observable(undefined);
        self.startedCalibration = ko.observable();

        self.onDialogShown = function() {
            self.calibration_zOffset(0);
            self.startedCalibration(false);
        };

        self.getAdditionalControls = function() {
            return [
                { name: "Xeed", type: "section", children: [
                    {name: "Set zOffset", javascript: self.startZOffset },
                    {name: "Level bed", command: "G32", confirm: "Do you want to level the bed?"},
                    {name: "Quick load", commands: ["G28 X0 Y0", "G1 X270 Y10 F9000", "G91", "G1 E1700 F2000", "G1 E100 F100", "G90"], confirm: "Do you want to load filament to the active nozzle? Make sure the filament is loaded correctly in the bottom drawer and your nozzle is pre-heated. This action will home X and Y, move the head to the load position(right front) and load the filament."},
                    {name: "Quick unload", commands: ["G91", "G1 E-50 F100", "G1 E-1750 F2000", "G90"], confirm: "Do you want to unload filament? Make sure you are ready to roll up the filament."}
                ]}
            ];
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
            self.control.sendHomeCommand('z');
            self.startedCalibration(true);

            self.control.sendJogCommand('z', 1, self.calibration_zOffset());
        };

        self.saveCalibration = function() {
            self.settings.settings.plugins.zoffset.zOffset(self.calibration_zOffset());
            self.settings.saveData();
            $("#zOffset_dialog").modal("hide");
        };

        self.onAfterBinding = function() {
            $("#zOffset_dialog").on("show", function(){
                self.onDialogShown();
            });
        };

        self.startZOffset = function() {
            $("#zOffset_dialog").modal("show");
        };
    }
    // This is how our plugin registers itself with the application, by adding some configuration
    // information to the global variable ADDITIONAL_VIEWMODELS
    ADDITIONAL_VIEWMODELS.push([
        // This is the constructor to call for instantiating the plugin
        ZOffsetViewModel,

        // This is a list of dependencies to inject into the plugin, the order which you request
        // here is the order in which the dependencies will be injected into your view model upon
        // instantiation via the parameters argument
        ["settingsViewModel", "controlViewModel", "loginStateViewModel"],

        // Finally, this is the list of all elements we want this view model to be bound to.
        [document.getElementById("zOffset_dialog")]
    ]);
});
