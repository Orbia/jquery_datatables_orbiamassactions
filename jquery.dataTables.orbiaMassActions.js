/*! OrbiaMassActions 0.1.0
* Copyright © 2015 Michał Biarda
*/

/**
* @summary OrbiaMassActions
* @description jQuery DataTables 1.10 plugin for mass actions
* @version 0.1.0
* @file jquery.dataTables.orbiaMassActions.js
* @author Michał Biarda
* @contact m.biarda@gmail.com
* @copyright Copyright 2015 Michał Biarda
*
* This source file is free software, available under the following license:
* MIT license - http://opensource.org/licenses/MIT
*
* This source file is distributed in the hope that it will be useful, but
* WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
* or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
*/

(function($) {
	
	var _addCheckboxesIfNeccesary = function(settings) {
		var $table = $(settings.nTable);
		$table.find("tbody tr").each(function() {
			var $this = $(this);
			if (!$this.find("." + settings.oClasses.sOrbiaMassActionsColumn).length) {
				$this.prepend($("<td>").addClass(settings.oClasses.sOrbiaMassActionsColumn));
			}
		});
	};
	
	$.fn.dataTable.OrbiaMassActions = function(api, options) {
		options = $.extend({}, options || {});
		var settings = api.settings()[0];
		if (settings.oInit.massActions && settings.oInit.massActions.length) {
			var $table = $(settings.nTable);
			$table.find("thead tr, tfoot tr").each(function() {
				$(this).prepend($("<th>").addClass(settings.oClasses.sOrbiaMassActionsColumn));
			});
			_addCheckboxesIfNeccesary(settings);
			$table.on('draw.dt', function(e, settings) {
				_addCheckboxesIfNeccesary(settings);
			});
		}
	};
	$.fn.DataTable.OrbiaMassActions = $.fn.dataTable.OrbiaMassActions;
	
	/**
	 * CSS classess used by default in HTML elements rendered by the plugin.
	 */
	$.extend($.fn.dataTableExt.classes, {
		sOrbiaMassActionsColumn: 'dataTables_orbia_mass_actions_column'
	});
	
})(jQuery);