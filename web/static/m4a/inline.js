$(document).ready(function () {
    m4a.loader.init();

    var url = m4a.viewmodel.url.proxy,
        viewmodel = m4a.viewmodel,
        view = m4a.view;
    
    viewmodel.mainMap = L.map('mainMap').setView(global_config.mainmap.center, global_config.mainmap.zoom);

    // Заполнение выпадающих списков
    $.ajax(url + global_config.language + "/" + global_config.city + "/stations").done(function (data) {
        m4a.view.$metroStartStation.select2({width: "100%", data: data, placeholder: 'Выберите станцию'});
        m4a.view.$metroEndStation.select2({width: "100%", data: data, placeholder: 'Выберите станцию'});

        // Поле выбора станции входа
        view.$metroStartStation.on("change", function () {
            m4a.stations.setStartStation(this.value);
            m4a.stations.updatePortalsByAjax(this.value, 'in');
            view.$metroStartStationExtent.prop("disabled", false);
            m4a.url.parse();
        });

        // Поле выбора станции выхода
        view.$metroEndStation.on("change", function () {
            m4a.stations.setEndStation(this.value);
            m4a.stations.updatePortalsByAjax(this.value, 'out');
            view.$metroEndStationExtent.prop("disabled", false);
            m4a.url.parse();
        });

        // Кнопка перехода к охвату станции входа
        view.$metroStartStationExtent.on("click", function () {
            m4a.viewmodel.mainMap.fitBounds(m4a.stations.portals['in']['layer'].getBounds());
        });

        // Кнопка перехода к охвату станции выхода
        view.$metroEndStationExtent.on("click", function () {
            m4a.viewmodel.mainMap.fitBounds(m4a.stations.portals['out']['layer'].getBounds());
        });

        // Карта для отображения маршрутов
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: "Map data &copy; <a href='http://osm.org'>OpenStreetMap</a> contributors",
            maxZoom: 18
        }).addTo(m4a.viewmodel.mainMap);

        $("#mainform").submit(function () {
            var view = m4a.view,
                start_station = view.$metroStartStation.val(),
                end_station = view.$metroEndStation.val();

            if (start_station.length == 0 || end_station.length == 0) {
                // todo: use bootstrap
                alert(m4a.resources.inline.start_st);
            } else if (start_station == end_station) {
                alert(m4a.resources.inline.eq_st);
            } else {
                $('.pagination').empty();
                $('#routePanel').empty();

                $.blockUI({ message: 'Processing...' });
                $.ajax({
                    dataType: "json",
                    url: url + global_config.language + "/" + global_config.city + "/routes/search",
                    data: $("#mainform").serialize()
                }).done(function (data) {
                    m4a.routes.buildRoutes(data);
                    $.unblockUI();
                });
            }
            return false;
        });

        m4a.url.parse();
    });
});