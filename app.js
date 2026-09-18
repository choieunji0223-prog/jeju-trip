(function () {
  "use strict";

  var STORAGE_KEY = "jejuTripState_v1";

  var DEFAULT_STATE = {
    header: {
      badge: "진지하세요 🍊",
      eyebrow: "OUR JEJU DREAM · 2 NIGHTS 3 DAYS",
      title: "제주 2박 3일",
      dateRange: "2026. 10. 18 (일) — 10. 20 (화)",
      stayLabel: "숙소",
      stayValue: "서귀포시 강정동 200<br>유승한내들퍼스트오션 112동 1001호",
      flightLabel: "귀경편",
      flightValue: "10/20 (화) 15:55 제주 → 서울"
    },
    photo: null,
    footerMsg: "즐거운 제주 여행 되세요 🍊",
    days: [
      {
        id: "d1",
        label: "D1",
        date: "10/18 (일)",
        title: "도착 · 우도",
        items: [
          { id: "i1", time: "11:00", activity: "제주공항 도착 ✈", memo: "" },
          { id: "i2", time: "점심", activity: "공항 근처 식사", memo: "" },
          { id: "i3", time: "오후", activity: "우도 섬 여행", memo: "배 타고 들어가서 구경" },
          { id: "i4", time: "이동", activity: "숙소 체크인", memo: "서귀포 강정동" },
          { id: "i5", time: "저녁", activity: "흑돼지 (숙소 근처)", memo: "" }
        ],
        notes: ""
      },
      {
        id: "d2",
        label: "D2",
        date: "10/19 (월)",
        title: "러닝 · 서귀포",
        items: [
          { id: "i6", time: "11:00", activity: "점심 · 갈치네거리식당", memo: "" },
          { id: "i7", time: "식후", activity: "카페", memo: "" },
          { id: "i8", time: "오후", activity: "법환포구 러닝 (올레 7길)", memo: "러닝 후 아이싱" },
          { id: "i9", time: "휴식", activity: "숙소에서 쉬기", memo: "" },
          { id: "i10", time: "19:00", activity: "서귀포시장 구경", memo: "근처에서 저녁" }
        ],
        notes: "🎒 챙길 것 (러닝)\n- 러닝복\n- 수건\n- 갈아입을 옷"
      },
      {
        id: "d3",
        label: "D3",
        date: "10/20 (화)",
        title: "귀경",
        items: [
          { id: "i11", time: "11:00", activity: "체크아웃", memo: "" },
          { id: "i12", time: "점심", activity: "공항 근처", memo: "해장길 또는 다른 맛집" },
          { id: "i13", time: "식후", activity: "카페", memo: "" },
          { id: "i14", time: "14:30", activity: "공항 도착 (늦어도)", memo: "" }
        ],
        notes: "✈ 제주 → 서울 · 15:55 비행기 출발"
      }
    ]
  };

  var state = loadState();
  var idCounter = Date.now();

  function uid(prefix) {
    idCounter += 1;
    return prefix + idCounter;
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  // ---------- 헤더 렌더 ----------
  function renderHeader() {
    var h = state.header;
    setField("badge", h.badge);
    setField("eyebrow", h.eyebrow);
    setField("title", h.title);
    setField("dateRange", h.dateRange);
    setField("stayLabel", h.stayLabel);
    setHtmlField("stayValue", h.stayValue);
    setField("flightLabel", h.flightLabel);
    setHtmlField("flightValue", h.flightValue);
    setField("footerMsg", state.footerMsg);

    var img = document.getElementById("photoImg");
    var placeholder = document.getElementById("photoPlaceholder");
    if (state.photo) {
      img.src = state.photo;
      img.style.display = "block";
      placeholder.style.display = "none";
    } else {
      img.style.display = "none";
      placeholder.style.display = "block";
    }
  }

  function setField(field, value) {
    var el = document.querySelector('[data-field="' + field + '"]');
    if (el && el.textContent !== value) el.textContent = value;
  }
  function setHtmlField(field, value) {
    var el = document.querySelector('[data-field="' + field + '"]');
    if (el && el.innerHTML !== value) el.innerHTML = value;
  }

  // ---------- DAY 렌더 ----------
  var itemTemplate = document.getElementById("itemTemplate");

  function renderDays() {
    var container = document.getElementById("daysContainer");
    container.innerHTML = "";

    state.days.forEach(function (day) {
      var card = document.createElement("section");
      card.className = "day-card";
      card.dataset.dayId = day.id;

      var head = document.createElement("div");
      head.className = "day-head";
      head.innerHTML =
        '<span class="day-label" contenteditable="true" data-day-field="label">' + escapeHtml(day.label) + '</span>' +
        '<span class="day-date" contenteditable="true" data-day-field="date">' + escapeHtml(day.date) + '</span>' +
        '<span class="day-sep">—</span>' +
        '<span class="day-title" contenteditable="true" data-day-field="title">' + escapeHtml(day.title) + '</span>' +
        '<button class="day-delete" title="이 DAY 삭제">🗑</button>';
      card.appendChild(head);

      var list = document.createElement("div");
      list.className = "item-list";
      list.dataset.dayId = day.id;

      day.items.forEach(function (item) {
        list.appendChild(buildItemRow(item));
      });
      card.appendChild(list);

      var addBtn = document.createElement("button");
      addBtn.className = "btn-add-item";
      addBtn.textContent = "+ 일정 추가";
      addBtn.addEventListener("click", function () {
        var newItem = { id: uid("i"), time: "시간", activity: "새 일정", memo: "" };
        day.items.push(newItem);
        saveState();
        renderDays();
      });
      card.appendChild(addBtn);

      var notes = document.createElement("div");
      notes.className = "day-notes";
      notes.contentEditable = "true";
      notes.dataset.dayField = "notes";
      notes.textContent = day.notes || "";
      card.appendChild(notes);

      // 삭제 버튼
      head.querySelector(".day-delete").addEventListener("click", function () {
        if (!confirm(day.label + " 일정을 삭제할까요?")) return;
        state.days = state.days.filter(function (d) { return d.id !== day.id; });
        saveState();
        renderDays();
      });

      // 편집 필드 바인딩
      head.querySelectorAll("[data-day-field]").forEach(function (el) {
        el.addEventListener("blur", function () {
          day[el.dataset.dayField] = el.textContent;
          saveState();
        });
      });
      notes.addEventListener("blur", function () {
        day.notes = notes.textContent;
        saveState();
      });

      container.appendChild(card);
      attachSortable(list);
    });
  }

  function buildItemRow(item) {
    var frag = itemTemplate.content.cloneNode(true);
    var row = frag.querySelector(".item-row");
    row.dataset.itemId = item.id;
    row.querySelector('[data-field="time"]').textContent = item.time;
    row.querySelector('[data-field="activity"]').textContent = item.activity;
    row.querySelector('[data-field="memo"]').textContent = item.memo;

    row.querySelectorAll("[data-field]").forEach(function (el) {
      el.addEventListener("blur", function () {
        item[el.dataset.field] = el.textContent;
        saveState();
      });
    });

    row.querySelector(".item-delete").addEventListener("click", function () {
      var day = findDayByItemId(item.id);
      if (day) {
        day.items = day.items.filter(function (it) { return it.id !== item.id; });
        saveState();
      }
      row.remove();
    });

    return row;
  }

  function findDayByItemId(itemId) {
    return state.days.filter(function (d) {
      return d.items.some(function (it) { return it.id === itemId; });
    })[0];
  }

  function findDayById(dayId) {
    return state.days.filter(function (d) { return d.id === dayId; })[0];
  }

  function attachSortable(listEl) {
    if (!listEl || typeof Sortable === "undefined") return;
    Sortable.create(listEl, {
      handle: ".drag-handle",
      animation: 150,
      onEnd: function () {
        var dayId = listEl.dataset.dayId;
        var day = findDayById(dayId);
        if (!day) return;
        var newOrder = Array.prototype.map.call(
          listEl.querySelectorAll(".item-row"),
          function (row) { return row.dataset.itemId; }
        );
        day.items.sort(function (a, b) {
          return newOrder.indexOf(a.id) - newOrder.indexOf(b.id);
        });
        saveState();
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  // ---------- 헤더 편집 바인딩 ----------
  function bindHeaderEditing() {
    document.querySelectorAll("#hero [data-field]").forEach(function (el) {
      el.addEventListener("blur", function () {
        var field = el.dataset.field;
        if (field === "stayValue" || field === "flightValue") {
          state.header[field] = el.innerHTML;
        } else {
          state.header[field] = el.textContent;
        }
        saveState();
      });
    });

    document.querySelector('.footer-msg').addEventListener("blur", function (e) {
      state.footerMsg = e.target.textContent;
      saveState();
    });
  }

  // ---------- 사진 업로드 ----------
  function fallbackReadAsDataUrl(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) { callback(e.target.result); };
    reader.onerror = function () { callback(null); };
    reader.readAsDataURL(file);
  }

  function resizeImageFile(file, maxSize, quality, callback) {
    if (typeof URL === "undefined" || !URL.createObjectURL) {
      fallbackReadAsDataUrl(file, callback);
      return;
    }
    var objectUrl = URL.createObjectURL(file);
    var img = new Image();
    var done = false;
    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      URL.revokeObjectURL(objectUrl);
      fallbackReadAsDataUrl(file, callback);
    }, 8000);

    img.onload = function () {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        var scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        var w = Math.max(1, Math.round(img.width * scale));
        var h = Math.max(1, Math.round(img.height * scale));
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(objectUrl);
        callback(canvas.toDataURL("image/jpeg", quality));
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        fallbackReadAsDataUrl(file, callback);
      }
    };
    img.onerror = function () {
      if (done) return;
      done = true;
      clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
      fallbackReadAsDataUrl(file, callback);
    };
    img.src = objectUrl;
  }

  function bindPhotoUpload() {
    var frame = document.getElementById("photoFrame");
    var input = document.getElementById("photoInput");
    frame.addEventListener("click", function () { input.click(); });
    input.addEventListener("change", function () {
      var file = input.files[0];
      if (!file) return;
      showToast("사진 처리 중...");
      resizeImageFile(file, 700, 0.85, function (dataUrl) {
        if (!dataUrl) {
          showToast("사진을 읽지 못했어요. 다른 사진으로 시도해보세요");
          return;
        }
        state.photo = dataUrl;
        var ok = saveState();
        renderHeader();
        showToast(ok ? "사진이 저장되었습니다 ✓" : "저장 공간이 부족해서 사진을 저장하지 못했어요");
      });
      input.value = "";
    });
  }

  // ---------- DAY 추가 / 초기화 ----------
  function bindGlobalButtons() {
    document.getElementById("addDayBtn").addEventListener("click", function () {
      var n = state.days.length + 1;
      state.days.push({
        id: uid("d"),
        label: "D" + n,
        date: "날짜 입력",
        title: "새 일정",
        items: [{ id: uid("i"), time: "시간", activity: "새 일정", memo: "" }],
        notes: ""
      });
      saveState();
      renderDays();
    });

    document.getElementById("resetBtn").addEventListener("click", function () {
      if (!confirm("모든 수정 내용을 지우고 기본값으로 되돌릴까요?")) return;
      localStorage.removeItem(STORAGE_KEY);
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      renderHeader();
      renderDays();
    });

    document.getElementById("saveBtn").addEventListener("click", function () {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      var ok = saveState();
      showToast(ok ? "저장되었습니다 ✓" : "저장 공간이 부족합니다 (사진을 지우거나 줄여보세요)");
    });
  }

  var toastTimer = null;
  function showToast(msg) {
    var toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    var duration = Math.min(4500, Math.max(1800, msg.length * 90));
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, duration);
  }

  // ---------- 초기 실행 ----------
  renderHeader();
  renderDays();
  bindHeaderEditing();
  bindPhotoUpload();
  bindGlobalButtons();
})();
