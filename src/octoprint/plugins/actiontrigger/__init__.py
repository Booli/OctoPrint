# coding=utf-8
from __future__ import absolute_import

import flask
import logging
import time
import threading

import octoprint.plugin
import octoprint.settings

default_settings = {
	"action_door": True,
	"action_filament": True
}

s = octoprint.plugin.plugin_settings("actiontrigger", defaults=default_settings)

##~~ Init Plugin and Metadata

__plugin_name__ = "Action Trigger"
__plugin_version__ = "0.1"


def __plugin_init__():
		global _plugin
		global __plugin_implementations__
		global __plugin_hooks__

		_plugin = ActionTriggerPlugin()
		__plugin_implementations__ = [_plugin]
		__plugin_hooks__ = {'octoprint.comm.protocol.action': _plugin.hook_actiontrigger}

class ActionTriggerPlugin(octoprint.plugin.TemplatePlugin,
						  octoprint.plugin.AssetPlugin,
						  octoprint.plugin.SettingsPlugin,
						  octoprint.plugin.EventHandlerPlugin,
						  octoprint.plugin.SimpleApiPlugin):
	
		def __init__(self):
			self.filament_action = False
			self.timer = None

		##def initialize(self):
		##	self.timer = threading.Timer(3, self.shutdown_heaters)

		##~~ TemplatePlugin
		def get_template_configs(self):
				return [
						dict(type="settings", name="Action Trigger", custom_bindings=False)
				]

		##~~ AssetsPlugin
		def get_assets(self):
				return dict(
						js=["js/actiontrigger.js"],
						css=["css/actiontrigger.css"]
				)

		##~ SettingsPlugin
		def on_settings_load(self):
				return dict(
						action_door=s.get_boolean(["action_door"]),
						action_filament=s.get_boolean(["action_filament"])
				)

		def on_settings_save(self, data):
				if "action_door" in data:
						s.set_boolean(["action_door"], data["action_door"])
				if "action_filament" in data:
						s.set_boolean(["action_filament"], data["action_filament"])

		def get_api_commands(self):
				return dict(
						reset_timer=[],
						cancel_timer=[]
				) 

		def on_api_command(self, command, data):
				import flask
				if command == "cancel_timer":
					self.timer.cancel()
				elif command == "reset_timer":
					pass


		##~~ ActionTriggerPlugin
		def hook_actiontrigger(self, comm, line, action_trigger):
				if action_trigger == None:
					return
				elif action_trigger == "door_open" and s.get_boolean(["action_door"]) and comm.isPrinting():
						self._send_client_message(action_trigger, dict(line=line))
						# might want to put this in separate function
						comm.setPause(True)
						self._printer.home("x")
				elif action_trigger == "door_closed" and s.get_boolean(["action_door"]):
						self._send_client_message(action_trigger, dict(line=line))
						comm.setPause(False)
				elif action_trigger == "filament" and s.get_boolean(["action_filament"]) and \
					 comm.isPrinting() and self.filament_action == False:
						self._send_client_message(action_trigger, dict(line=line))
						comm.setPause(True)
						self._printer.home("x")
						self.filament_action = True
						self.timer = threading.Timer(60, self.shutdown_heaters)
						self.timer.start()

		# Send trigger to front end
		def _send_client_message(self, message_type, data=None):
				self._plugin_manager.send_plugin_message("actiontrigger", dict(type=message_type, data=data))

		# Set flags on event
		def on_event(self, event, payload):
			if event == "PrintResumed" or event == "PrintStarted":
				self.filament_action = False

		def shutdown_heaters(self):
			self._send_client_message("shutdown_heaters", dict(time=""))
			self._printer.set_temperature("tool0", 0.0)
			self._printer.set_temperature("tool1", 0.0)
			self._printer.set_temperature("bed", 0.0)


