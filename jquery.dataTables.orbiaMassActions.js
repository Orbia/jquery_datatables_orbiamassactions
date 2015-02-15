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

	var _addCheckboxesIfNeccesary = function(settings, options) {
		var $table = $(settings.nTable);
		var checked = $table.data('checked');
		var api = $table.DataTable();
		var rowsIndexes = api.rows().flatten();
		$.each(rowsIndexes, function() {
			var row = api.row(this);
			var $tr = $(row.node());
			var data = row.data();
			if (!$tr.find("." + settings.oClasses.sOrbiaMassActionsColumn).length) {
				var $td = $("<td>").addClass(settings.oClasses.sOrbiaMassActionsColumn);
				var $checkbox = $("<input>").attr({
					type: 'checkbox',
					name: 'checked[' + data[options.idColumn.data] + ']',
					value: '1',
					checked: $.inArray(data[options.idColumn.data] + '', checked) !== -1
				}).data('id', data[options.idColumn.data] + '').on('change', function() {
					var $this = $(this);
					(function(t) {
						var checked = t.data('checked');
						if ($this.is(":checked")) {
							checked.push($this.data('id'));
						} else {
							var pos = $.inArray($this.data('id'), checked);
							if (pos !== -1) {
								checked.splice(pos, 1);
							}
						}
					})($table);
				});
				$tr.prepend($td.append($checkbox));
			}
		});
	};
	
	var _updateIds = function(settings) {
		var $table = $(settings.nTable);
		var ids = $table.data('ids') || [];
		$.each(settings.json.ids, function() {
			var id = this + '';
			if ($.inArray(id, ids) === -1) {
				ids.push(id);
			}
		});
		$table.data('ids', ids);
	};

	$.fn.dataTable.OrbiaMassActions = function(api, options) {
		options = $.extend({
			idColumn: {
				name: 'id',
				data: 'id'
			},
			checked: []
		}, options || {});
		var checked = [];
		$.each(options.checked, function() {
			checked.push(this + '');
		});
		options.checked = checked;
		var settings = api.settings()[0];
		if (settings.oInit.orbiaMassActions && settings.oInit.orbiaMassActions.length) {
			var $table = $(settings.nTable);
			$table.data('idColumn', options.idColumn);
			var serverSide = settings.oFeatures.bServerSide;
			$table.data('checked', options.checked).find("thead tr, tfoot tr").each(function() {
				$(this).prepend($("<th>").addClass(settings.oClasses.sOrbiaMassActionsColumn));
			});
			_addCheckboxesIfNeccesary(settings, options);
			$table.on('draw.dt', function(e, settings) {
				_addCheckboxesIfNeccesary(settings, options);
				if (serverSide) {
					_updateIds(settings);
				}
			});
		}
	};
	$.fn.DataTable.OrbiaMassActions = $.fn.dataTable.OrbiaMassActions;

	$.fn.dataTable.ext.feature.push({
		fnInit: function(settings) {
			var language = settings.oLanguage;
			var tableId = settings.sTableId;
			var wrapper = $("<ul>")
					.addClass(settings.oClasses.sOrbiaMassActionsCheckers)
					.attr('id', tableId + '_orbia_mass_actions_checkers');
			var checkers = ['CheckAll', 'UncheckAll', 'CheckVisible', 'UncheckVisible', 'CheckFiltered', 'UncheckFiltered'];
			$.each(checkers, function() {
				var checker = this;
				$("<li>")
						.addClass(settings.oClasses['sOrbiaMassActions' + checker])
						.append(
								$("<a>").attr('href', '#')
								.on('click', function() {
									$.fn.dataTable['OrbiaMassActions' + checker](settings);
									return false;
								})
								.html(language.oOrbiaMassActions['s' + checker])
								)
						.appendTo(wrapper);
			});
			return wrapper.get(0);
		},
		cFeature: 'H'
	});
	
	$.fn.dataTable.Api.register('row().check()', function() {
		var settings = this.context[0];
		var $tr = $(this.node());
		$tr.find("." + settings.oClasses.sOrbiaMassActionsColumn + " input:not(:checked)")
				.attr('checked', true)
				.prop('checked', true)
				.trigger('change');
		return this;
	});
	
	$.fn.dataTable.Api.register('row().uncheck()', function() {
		var settings = this.context[0];
		var $tr = $(this.node());
		$tr.find("." + settings.oClasses.sOrbiaMassActionsColumn + " input:checked")
				.attr('checked', false)
				.prop('checked', false)
				.trigger('change');
		return this;
	});
	
	$.fn.dataTable.Api.register('table().checkAll()', function() {
		var settings = this.context[0];
		var $table = $(settings.nTable);
		var serverSide = settings.oFeatures.bServerSide;
		$.each(this.$("tr"), function() {
			$(this).find("." + settings.oClasses.sOrbiaMassActionsColumn + " input:not(:checked)").each(function() {
				$(this).attr('checked', true).prop('checked', true);
			});
		});
		if (serverSide) {
			$table.data('checked', $table.data('ids'));
		} else {
			$table.data('checked', this.column($table.data('idColumn').name + ':name').data().toArray());
		}
		return this;
	});
	
	$.fn.dataTable.Api.register('table().uncheckAll()', function() {
		var settings = this.context[0];
		var $table = $(settings.nTable);
		$.each(this.$("tr"), function() {
			$(this).find("." + settings.oClasses.sOrbiaMassActionsColumn + " input:checked").each(function() {
				$(this).attr('checked', false).prop('checked', false);
			});
		});
		$table.data('checked', []);
		return this;
	});
	
	$.fn.dataTable.OrbiaMassActionsCheckAll = function(settings) {
		$(settings.nTable).DataTable().table().checkAll();
	};
	
	$.fn.dataTable.OrbiaMassActionsUncheckAll = function(settings) {
		$(settings.nTable).DataTable().table().uncheckAll();
	};
	
	$.fn.dataTable.OrbiaMassActionsCheckVisible = function(settings) {
		
	};
	
	$.fn.dataTable.OrbiaMassActionsUncheckVisible = function(settings) {
		
	};
	
	$.fn.dataTable.OrbiaMassActionsCheckFiltered = function(settings) {
		
	};
	
	$.fn.dataTable.OrbiaMassActionsUncheckFiltered = function(settings) {
		
	};

	/**
	 * CSS classess used by default in HTML elements rendered by the plugin.
	 */
	$.extend($.fn.dataTableExt.classes, {
		sOrbiaMassActionsColumn: 'dataTables_orbia_mass_actions_column',
		sOrbiaMassActionsCheckers: 'dataTables_orbia_mass_actions_checkers',
		sOrbiaMassActionsCheckAll: 'dataTables_orbia_mass_actions_check_all',
		sOrbiaMassActionsUnheckAll: 'dataTables_orbia_mass_actions_uncheck_all',
		sOrbiaMassActionsCheckVisible: 'dataTables_orbia_mass_actions_check_visible',
		sOrbiaMassActionsUnheckVisible: 'dataTables_orbia_mass_actions_uncheck_visible',
		sOrbiaMassActionsCheckFiltered: 'dataTables_orbia_mass_actions_check_filtered',
		sOrbiaMassActionsUnheckFiltered: 'dataTables_orbia_mass_actions_uncheck_filtered'
	});

	/**
	 * Default language strings used by the plugin.
	 */
	$.extend($.fn.dataTable.defaults.oLanguage, {
		oOrbiaMassActions: {
			sCheckAll: 'Check all',
			sUncheckAll: 'Uncheck all',
			sCheckVisible: 'Check visible',
			sUncheckVisible: 'Uncheck visible',
			sCheckFiltered: 'Check filtered',
			sUncheckFiltered: 'Uncheck filtered'
		}
	});

})(jQuery);