
var map = new naver.maps.Map("map", {
  center: new naver.maps.LatLng(37.4985248, 127.0326343),
  zoom: 17,
  mapTypeControl: true
});

var infoWindow = new naver.maps.InfoWindow({
  anchorSkew: true
});

map.setCursor('pointer');

function searchCoordinateToAddress(latlng) {
  infoWindow.close();

  naver.maps.Service.reverseGeocode({
    coords: latlng,
    orders: [
      naver.maps.Service.OrderType.ADDR,
      naver.maps.Service.OrderType.ROAD_ADDR
    ].join(',')
  }, function (status, response) {
    if (status === naver.maps.Service.Status.ERROR) {
      return alert('Something Wrong!');
    }

    var items = response.v2.results,
      address = '',
      htmlAddresses = [];

    for (var i = 0, ii = items.length, item, addrType; i < ii; i++) {
      item = items[i];
      address = makeAddress(item) || '';
      addrType = item.name === 'roadaddr' ? '[도로명 주소]' : '[지번 주소]';

      htmlAddresses.push((i + 1) + '. ' + addrType + ' ' + address);
    }

    infoWindow.setContent([
      '<div style="padding:10px;min-width:200px;line-height:150%;">',
      '<h4 style="margin-top:5px;">Search Coordinates</h4><br />',
      htmlAddresses.join('<br />'),
      '</div>'
    ].join('\n'));

    infoWindow.open(map, latlng);
  });
}

function searchAddressToCoordinate(address) {
  naver.maps.Service.geocode({
    query: address
  }, function (status, response) {
    if (status === naver.maps.Service.Status.ERROR) {
      //TODO
      return alert('Something Wrong!');
    }

    if (response.v2.meta.totalCount === 0) {
      return alert('totalCount' + response.v2.meta.totalCount);
    }

    var htmlAddresses = [],
      item = response.v2.addresses[0],
      point = new naver.maps.Point(item.x, item.y);

    if (item.roadAddress) {
      htmlAddresses.push('[도로명 주소] ' + item.roadAddress);
    }

    if (item.jibunAddress) {
      htmlAddresses.push('[지번 주소] ' + item.jibunAddress);
    }

    if (item.englishAddress) {
      htmlAddresses.push('[영문명 주소] ' + item.englishAddress);
    }

    infoWindow.setContent([
      '<div style="padding:10px;min-width:200px;line-height:150%;">',
      '<h4 style="margin-top:5px;">Search Address : ' + address + '</h4><br />',
      htmlAddresses.join('<br />'),
      '</div>'
    ].join('\n'));

    map.setCenter(point);
    infoWindow.open(map, point);

  //TODO
    $(".sinfo").html("<tr><td>"+item.roadAddress+"</td></tr>");
  });
}

function initGeocoder() {
  map.addListener('click', function (e) {
    searchCoordinateToAddress(e.coord);
  });

  document.getElementById('submit').addEventListener('click', function () {
    searchAddressToCoordinate(document.getElementById('address').value);
  });

  document.getElementById('address').addEventListener('keydown', function (e) {
    console.log(e.target);
    console.log(this);
    var keyCode = e.target.which || e.target.keyCode;
    if (keyCode === 13) { // Enter key
      searchAddressToCoordinate(document.getElementById('address').value);
    }
  });

  searchAddressToCoordinate('');
}

function makeAddress(item) {
  if (!item) {
    return;
  }

  var name = item.name,
    region = item.region,
    land = item.land,
    isRoadAddress = name === 'roadaddr';

  var sido = '', sigugun = '', dongmyun = '', ri = '', rest = '';

  if (hasArea(region.area1)) {
    sido = region.area1.name;
  }

  if (hasArea(region.area2)) {
    sigugun = region.area2.name;
  }

  if (hasArea(region.area3)) {
    dongmyun = region.area3.name;
  }

  if (hasArea(region.area4)) {
    ri = region.area4.name;
  }

  if (land) {
    if (hasData(land.number1)) {
      if (hasData(land.type) && land.type === '2') {
        rest += '산';
      }

      rest += land.number1;

      if (hasData(land.number2)) {
        rest += ('-' + land.number2);
      }
    }

    if (isRoadAddress === true) {
      if (checkLastString(dongmyun, '면')) {
        ri = land.name;
      } else {
        dongmyun = land.name;
        ri = '';
      }

      if (hasAddition(land.addition0)) {
        rest += ' ' + land.addition0.value;
      }
    }
  }

  return [sido, sigugun, dongmyun, ri, rest].join(' ');
}

function hasArea(area) {
  return !!(area && area.name && area.name !== '');
}

function hasData(data) {
  return !!(data && data !== '');
}

function checkLastString(word, lastString) {
  return new RegExp(lastString + '$').test(word);
}

function hasAddition(addition) {
  return !!(addition && addition.value);
}

naver.maps.onJSContentLoaded = initGeocoder

// 지적도 버튼

var cadastralLayer = new naver.maps.CadastralLayer();
var btn = $('#cadastral');


// var defaultset = function(){ btn.addClass('control-on').val('지적도 끄기') }; 
// defaultset();


//nav-link py-3 border-bottom control-btn
//nav-link py-3 border-bottom control-btn control-on

btn.on('click', function(e) {
    e.preventDefault();
    
    if (cadastralLayer.getMap()) {
        cadastralLayer.setMap(null);
        btn.removeClass('control-on').val('지적도 켜기');
    } else {
        cadastralLayer.setMap(map);
        btn.addClass('control-on').val('지적도 끄기');
    }
});


naver.maps.Event.once(map, 'init', function() {
    cadastralLayer.setMap(null);
    //cadastralLayer.setMap(map);
});