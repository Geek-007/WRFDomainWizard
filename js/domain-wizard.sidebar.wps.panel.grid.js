/**
 * @constructor
 */
WRFDomainWizard.Sidebar.WPSPanel.Grid = function (container, grid, errorHandler) {

    var self = this,
        domain = grid.domain,
        gridContainer,
        buttonRemoveNest,
        buttonAddNest,
        buttonGeogDataResEdit,
        labelGridName,
        inputParentGridRatio,
        inputIParentStart,
        inputJParentStart,
        inputEWE,
        inputESN,
        inputGeogDataRes,
        iSelected,
        tableCornerSW,
        tableCornerSE,
        tableCornerNE,
        tableCornerNW;

    if (WRFDomainWizard.Sidebar.WPSPanel.Grid.Template == null) {
        WRFDomainWizard.Sidebar.WPSPanel.Grid.Template = $('#grid_template', container).html();
        $('#grid_template', container).remove();
    }

    gridContainer = $('<div class="container-grid"></div>').append(WRFDomainWizard.Sidebar.WPSPanel.Grid.Template);
    buttonRemoveNest = $('button[data-action="remove-nest"]', gridContainer);
    buttonAddNest = $('button[data-action="add-nest"]', gridContainer);
    buttonGeogDataResEdit = $('button[data-action="geog-data-res-edit"]', gridContainer);

    labelGridName = $('label.grid-label', gridContainer);

    inputParentGridRatio = $('input[name="parent_grid_ratio"]', gridContainer);
    inputIParentStart = $('input[name="i_parent_start"]', gridContainer);
    inputJParentStart = $('input[name="j_parent_start"]', gridContainer);
    inputEWE = $('input[name="e_we"]', gridContainer);
    inputESN = $('input[name="e_sn"]', gridContainer);
    inputGeogDataRes = $('span[data-name="geog_data_res"]', gridContainer);

    tableCornerNW = $('table tbody tr:nth-child(1) td:nth-child(2)', gridContainer);
    tableCornerNE = $('table tbody tr:nth-child(1) td:nth-child(3)', gridContainer);
    tableCornerSW = $('table tbody tr:nth-child(2) td:nth-child(2)', gridContainer);
    tableCornerSE = $('table tbody tr:nth-child(2) td:nth-child(3)', gridContainer);

    container.append(gridContainer);
    // enable tooltips
    $('[title]', gridContainer).tooltip();
    $('input[name]', gridContainer).on('change blur keyup', function (e) {
        self.validate();
    });

    buttonGeogDataResEdit.on('click', function (e) {
        geogDataResDialog(grid.geog_data_res, function (e) {
            grid.geog_data_res = e.geog_data_res;
            inputGeogDataRes.text(e.geog_data_res);
            inputGeogDataRes.attr('title', e.geog_data_res);
        }).show();
    });

    grid.on('wps:remove', function (e) {
        gridContainer.remove();
    });

    function markSelected() {
        iSelected = $('<i class="fas fa-vector-square mx-1"></i>')
        iSelected.insertBefore(labelGridName);
    }

    grid.on('wps:change', setFieldValues);
    grid.on('wps:id-change', setGridName);
    grid.on('wps:select', function () {
        if (!iSelected) {
            markSelected();
        }
    });
    grid.on('wps:unselect', function () {
        if (iSelected) {
            iSelected.remove();
            iSelected = null;
        }
    });

    // hide tooltip when button is clicked
    $('button[title]', gridContainer).click(function (e) {
        $(this).tooltip('hide');
    });

    // remove domain button click event handler
    buttonRemoveNest.on('click', function (e) {
        grid.parent.removeNest(grid);
    });

    function reportError(error) {
        if (typeof errorHandler === 'function') {
            errorHandler.call(this, { error: error });
        }
    }

    // remove domain button click event handler
    buttonAddNest.on('click', function (e) {
        var nest = null;
        if (location.hostname === 'localhost') {
            nest = grid.createNest();
            nest.gridPanel = WRFDomainWizard.Sidebar.WPSPanel.grid(container, nest, errorHandler);
        }
        else {
            try {
                nest = grid.createNest();
                nest.gridPanel = WRFDomainWizard.Sidebar.WPSPanel.grid(container, nest, errorHandler);
            }
            catch (error) {
                reportError(error);
            }
        }
    });

    if (grid.parent) {
        inputIParentStart.prop('min', WRFDomainGrid.minNestGridPoints);
        inputJParentStart.prop('min', WRFDomainGrid.minNestGridPoints);
    }
    else {
        buttonRemoveNest.remove();
        inputParentGridRatio.prop('disabled', true);
        inputParentGridRatio.removeAttr('required');
        inputIParentStart.prop('disabled', true);
        inputIParentStart.removeAttr('required');
        inputJParentStart.prop('disabled', true);
        inputJParentStart.removeAttr('required');
    }

    for (var i = 0; i < grid.nests.length; i++) {
        grid.nests[i].gridPanel = WRFDomainWizard.Sidebar.WPSPanel.grid(container, grid.nests[i], errorHandler);
    }

    function setGridName() {
        if (grid.parent) {
            labelGridName.text(grid.name + ' (parent: ' + 'd' + grid.parent.id.toString().padStart(2, '0') + ')');
        }
        else {
            labelGridName.text(grid.name);
        }
    }

    function setFieldValues() {
        inputParentGridRatio.val(grid.parent_grid_ratio);
        inputIParentStart.val(grid.i_parent_start);
        inputJParentStart.val(grid.j_parent_start);
        inputEWE.val(grid.e_we);
        inputESN.val(grid.e_sn);
        inputGeogDataRes.text(grid.geog_data_res);
        inputGeogDataRes.attr('title', grid.geog_data_res);
        inputGeogDataRes.tooltip();

        tableCornerSW.text(grid.corners.sw.lat.toFixed(3) + ', ' + grid.corners.sw.lng.toFixed(3));
        tableCornerSE.text(grid.corners.se.lat.toFixed(3) + ', ' + grid.corners.se.lng.toFixed(3));
        tableCornerNE.text(grid.corners.ne.lat.toFixed(3) + ', ' + grid.corners.ne.lng.toFixed(3));
        tableCornerNW.text(grid.corners.nw.lat.toFixed(3) + ', ' + grid.corners.nw.lng.toFixed(3));

        self.validate();
    }

    function setFieldConstraints() {

        if (grid.id > 1) {

            var parent_grid_ratio = parseInt(inputParentGridRatio.val(), 10);
            var i_parent_start = parseInt(inputIParentStart.val(), 10);
            var j_parent_start = parseInt(inputJParentStart.val(), 10);
            var parent_e_we = grid.parent.e_we;
            var parent_e_sn = grid.parent.e_sn;
            var max_e_we = Math.floor((parent_e_we - WRFDomainGrid.minNestGridPoints - i_parent_start) * parent_grid_ratio + 1);
            var max_e_sn = Math.floor((parent_e_sn - WRFDomainGrid.minNestGridPoints - j_parent_start) * parent_grid_ratio + 1);

            inputEWE.prop('max', max_e_we);
            inputESN.prop('max', max_e_sn);
            inputEWE.prop('step', parent_grid_ratio);
            inputESN.prop('step', parent_grid_ratio);
            inputIParentStart.prop('min', WRFDomainGrid.minNestGridPoints + 1);
            inputJParentStart.prop('min', WRFDomainGrid.minNestGridPoints + 1);
            inputIParentStart.prop('max', parent_e_we - 2 * WRFDomainGrid.minNestGridPoints);
            inputJParentStart.prop('max', parent_e_sn - 2 * WRFDomainGrid.minNestGridPoints);
        }
    }

    function clearValidation() {
        $('.invalid-feedback', gridContainer).hide().empty();
        $('.is-invalid, .is-valid', gridContainer).removeClass('.is-invalid').removeClass('.is-valid');
    }

    function showError(input, error) {
        $('div[data-val-for="' + input.prop('name') + '"]', gridContainer).show().append('<p>' + error + '</p>');
        input.addClass('.is-invalid');
    }

    function checkValidity(input) {
        if (!input[0].checkValidity()) {
            showError(input, input[0].validationMessage.replace(/[v,V]alue|(this field)/, input.prop('name')));
            return false;
        }
        return true;
    }

    this.validate = function() {
        var valid = true,
            error;

        if (grid.parent != null) {
            
            clearValidation();
            setFieldConstraints();

            valid = checkValidity(inputParentGridRatio);
            valid = checkValidity(inputIParentStart) && valid;
            valid = checkValidity(inputJParentStart) && valid;
            valid = checkValidity(inputEWE) && valid;
            valid = checkValidity(inputESN) && valid;

            if (valid) {
                var parent_grid_ratio = parseInt(inputParentGridRatio.val(), 10),
                    i_parent_start = parseInt(inputIParentStart.val(), 10),
                    j_parent_start = parseInt(inputJParentStart.val(), 10),
                    e_we = parseInt(inputEWE.val(), 10),
                    e_sn = parseInt(inputESN.val(), 10),
                    parent_e_we = grid.parent.e_we,
                    parent_e_sn = grid.parent.e_sn;

                if (i_parent_start < WRFDomainGrid.minNestGridPoints) {
                    showError(inputIParentStart, 'Min i_parent_start = ' + WRFDomainGrid.minNestGridPoints + '. ');
                    valid = false;
                }
                

                if (j_parent_start < WRFDomainGrid.minNestGridPoints) {
                    showError(inputJParentStart, 'Min j_parent_start = ' + WRFDomainGrid.minNestGridPoints + '. ');
                    valid = false;
                }

                if (i_parent_start > (parent_e_we - WRFDomainGrid.minNestGridPoints)) {
                    showError(inputIParentStart, 'Max i_parent_start = ' + (parent_e_we - WRFDomainGrid.minNestGridPoints) + '. ');
                    valid = false;
                }
                if (j_parent_start > (parent_e_sn - WRFDomainGrid.minNestGridPoints)) {
                    showError(inputJParentStart, 'Max j_parent_start = ' + (parent_e_sn - WRFDomainGrid.minNestGridPoints) + '. ');
                    valid = false;
                }

                if (((e_we - 1) % parent_grid_ratio) != 0) {
                    showError(inputEWE, "e_we must be one greater than an integer multiple of the nest's parent_grid_ratio (e_we = n*parent_grid_ratio + 1).");
                    valid = false;
                }
                if (((e_sn - 1) % parent_grid_ratio) != 0) {
                    showError(inputESN, "e_sn must be one greater than an integer multiple of the nest's parent_grid_ratio (e_sn = n*parent_grid_ratio + 1).");
                    valid = false;
                }

                var max_e_we = Math.floor((parent_e_we - WRFDomainGrid.minNestGridPoints - i_parent_start) * parent_grid_ratio + 1);
                var max_e_sn = Math.floor((parent_e_sn - WRFDomainGrid.minNestGridPoints - j_parent_start) * parent_grid_ratio + 1);

                if (e_we > max_e_we || e_sn > max_e_sn) {
                    showError(inputESN, 'Nest edge outside of parent. ');
                    valid = false;
                }

                if (e_we > max_e_we) {
                    max_e_we = Math.floor((parent_e_we - i_parent_start - WRFDomainGrid.minNestGridPoints) * parent_grid_ratio + 1);
                    showError(inputEWE, 'Max e_we = ' + max_e_we + '. ');
                    valid = false;
                }
                if (e_sn > max_e_sn) {
                    max_e_sn = Math.floor((parent_e_sn - j_parent_start - WRFDomainGrid.minNestGridPoints) * parent_grid_ratio + 1);
                    showError(inputESN, 'Max e_sn = ' + max_e_sn + '. ');
                    valid = false;
                }
            }
        }

        for (var i = 0; i < grid.nests.length; i++) {
            valid = valid && grid.nests[i].gridPanel.validate();
        }

        return valid;
    }

    this.setGridValues = function () {
        grid.parent_grid_ratio = parseInt(inputParentGridRatio.val(), 10);
        grid.i_parent_start = parseInt(inputIParentStart.val(), 10);
        grid.j_parent_start = parseInt(inputJParentStart.val(), 10);
        grid.e_we = parseInt(inputEWE.val(), 10);
        grid.e_sn = parseInt(inputESN.val(), 10);
        grid.geog_data_res = inputGeogDataRes.val()
        for (var i = 0; i < grid.nests.length; i++) {
            grid.nests[i].gridPanel.setGridValues();
        }
    }

    setGridName();
    setFieldValues();
    if (grid.selected) {
        markSelected();
    }
}

WRFDomainWizard.Sidebar.WPSPanel.Grid.Template = null;

WRFDomainWizard.Sidebar.WPSPanel.grid = function (container, grid, errorHandler) {
    return new WRFDomainWizard.Sidebar.WPSPanel.Grid(container, grid, errorHandler);
}