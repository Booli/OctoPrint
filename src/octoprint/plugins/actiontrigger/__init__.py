# coding=utf-8
from __future__ import absolute_import

import flask
import logging
import time
import threading

import octoprint.plugin
import octoprint.settings

from octoprint.util import RepeatedTimer

##~~ Init Plugin and Metadata

__plugin_name__ = "Action Trigger"
__plugin_version__ = "0.1"


def __plugin_load__():
		global plugin
		global __plugin_implementation__
		global __plugin_hooks__

		plugin = ActionTriggerPlugin()
		__plugin_implementation__ = _plugin
		__plugin_hooks__ = {'octoprint.comm.protocol.action': _plugin.hook_actiontrigger}

class ActionTriggerPlugin(octoprint.plugin.TemplatePlugin,
						  octoprint.plugin.AssetPlugin,
						  octoprint.plugin.SettingsPlugin,
						  octoprint.plugin.EventHandlerPlugin,
						  octoprint.plugin.SimpleApiPlugin,
						  octoprint.plugin.StartupPlugin):
	
		def __init__(self):
			self.filament_action = False
			self.filament_timer = None
			self.start_time = None
			self.time_out = None

		##~~ TemplatePlugin
		def get_template_configs(self):
				return [
						dict(type="settings", name="Action Trigger", custom_bindings=False)
				]

		##~~ SettingsPlugin
		def get_settings_defaults(self):
				return dict(
						action_door = False,
						action_filament = False,
						time_out = 900	
				)

		##~~ StartupPlugin
		def on_after_startup(self):
			self.time_out = self._settings.get_int(["time_out"])

		##~~ AssetsPlugin
		def get_assets(self):
				return dict(
						js=["js/actiontrigger.js"],
						css=["css/actiontrigger.css"]
				)

		def get_api_commands(self):
				return dict(
						reset_timer=[],
						cancel_timer=[]
				) 

		def on_api_command(self, command, data):
				import flask
				if command == "cancel_timer":
					if self.filament_timer is not None:
						self.filament_timer.cancel()
						self._send_client_message("close_dialog")
				elif command == "reset_timer":
					pass


		##~~ ActionTriggerPlugin
		def hook_actiontrigger(self, comm, line, action_trigger):
				if action_trigger == None:
					return
				elif action_trigger == "door_open" and self._settings.get_boolean(["action_door"]) and comm.isPrinting():
						self._send_client_message(action_trigger, dict(line=line))
						# might want to put this in separate function
						comm.setPause(True)
						self._printer.home("x")
				elif action_trigger == "door_closed" and self._settings.get_boolean(["action_door"]):
						self._send_client_message("close_dialog", dict(line=line))
						comm.setPause(False)
				elif action_trigger == "filament" and self._settings.get_boolean(["action_filament"]) and \
					 comm.isPrinting() and self.filament_action == False:
						self._send_client_message(action_trigger, dict(line=line))
						comm.setPause(True)
						self._printer.home("x")
						self.filament_action = True
						self.time_out = self._settings.get_int(["time_out"])
						self.filament_timer = RepeatedTimer(1.0, self.filamentTimer, run_first=True)
						self.start_time = time.time()
						self.filament_timer.start()

		# Send trigger to front end
		def _send_client_message(self, message_type, data=None):
				self._plugin_manager.send_plugin_message("actiontrigger", dict(type=message_type, data=data))

		# Set flags on event
		def on_event(self, event, payload):
			if event == "PrintResumed" or event == "PrintStarted" or event == "PrintCancelled":
				self.filament_action = False
				self.filament_timer.cancel()

		def shutdown_heaters(self):
			self._send_client_message("shutdown_heaters", dict(time=""))
			self._printer.set_temperature("tool0", 0.0)
			self._printer.set_temperature("tool1", 0.0)
			self._printer.set_temperature("bed", 0.0)

		def filamentTimer(self):
			if self.time_out is None:
				self.time_out = self._settings.get_int(["time_out"])
			if self.start_time is not None:
				self.now = time.time()
				if self.now - self.start_time > self.time_out:
					self.shutdown_heaters()
					self.start_time = None
					self.filament_timer.cancel()
					return
				self._send_client_message("update_timer", dict(timer=int(self.time_out-(self.now - self.start_time))))



