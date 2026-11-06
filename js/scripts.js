
const API_URL = 'https://script.google.com/macros/s/AKfycbx_7isnmHGCpb1jsj1ryXmL-ZpP0mAHD6N7S2BgVmn9IUGIYkMCONBPCJ5Xv13kNsAF/exec';

const input = document.getElementById('guestSearch');
const results = document.getElementById('results');
const selectedGuest = document.getElementById('selectedGuest');
const guestName = document.getElementById('guestName');
const tableNumber = document.getElementById('tableNumber');
const status = document.getElementById('status');
const clearBtn = document.getElementById('clearBtn');
const searchBtn = document.getElementById('searchBtn');

let requestId = 0;

const tablePositions = {
  1: [17, 82], 2: [50, 74], 3: [64, 74],
  4: [85, 76], 5: [17, 74], 6: [50, 66],
  7: [64, 66], 8: [85, 69], 9: [17, 66],
  10: [50, 58], 11: [64, 58], 12: [85, 62],
  13: [17, 58], 14: [50, 50], 15: [64, 50],
  16: [85, 56], 17: [17, 50], 18: [85, 50],
  19: [8, 24], 20: [34, 25], 21: [50, 25],
  22: [64, 25], 23: [85, 24], 24: [8, 16],
  25: [34, 17], 26: [50, 17], 27: [64, 17],
  28: [85, 16], 29: [8, 9], 30: [34, 9],
  31: [50, 9], 32: [64, 9], 33: [85, 9],
  34: [8, 2], 35: [34, 1], 36: [50, 1],
  37: [64, 1], 38: [85, 2], 39: [8, -4],
  40: [85, -4]
};

// შეყვანის ველის კონტროლი
input.addEventListener('input', () => {
  results.innerHTML = '';
  selectedGuest.classList.add('hidden');
  status.textContent = '';

  clearBtn.style.display = input.value.trim() ? 'block' : 'none';

  searchBtn.disabled = false;
  searchBtn.textContent = 'სახელის ძიება';

  requestId++;
});

// ღილაკზე დაჭერით ძიება
searchBtn.addEventListener('click', () => {
  const query = input.value.trim();

  results.innerHTML = '';
  selectedGuest.classList.add('hidden');

  if (query.length < 2) {
    status.textContent = 'შეიყვანეთ მინიმუმ 2 სიმბოლო.';
    return;
  }

  searchGuests(query);
});

// Enter ღილაკით ძიებაც შესაძლებელი იქნება
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    searchBtn.click();
  }
});

function searchGuests(query) {
  const currentRequest = ++requestId;
  const callbackName = 'guestCallback' + currentRequest;

  status.textContent = 'მიმდინარეობს ძიება...';

  searchBtn.disabled = true;
  searchBtn.textContent = 'მიმდინარეობს ძიება...';

  const script = document.createElement('script');

  const timeout = setTimeout(() => {
    cleanup();

    if (currentRequest === requestId) {
      status.textContent = 'კავშირი ვერ დამყარდა. სცადეთ თავიდან.';
      searchBtn.disabled = false;
      searchBtn.textContent = 'ხელახლა ძიება';
    }
  }, 12000);

  function cleanup() {
    clearTimeout(timeout);
    script.remove();
    delete window[callbackName];
  }

  window[callbackName] = (data) => {
    cleanup();

    if (currentRequest !== requestId) return;

    searchBtn.disabled = false;
    searchBtn.textContent = 'ძიება დასრულებულია';

    if (!Array.isArray(data)) {
      status.textContent = 'მონაცემების მიღება ვერ მოხერხდა.';
      searchBtn.textContent = 'ხელახლა ძიება';
      return;
    }

    showResults(data);
  };

  script.src =
    API_URL +
    '?q=' + encodeURIComponent(query) +
    '&callback=' + callbackName +
    '&_=' + Date.now();

  script.onerror = () => {
    cleanup();

    if (currentRequest === requestId) {
      status.textContent = 'დაფიქსირდა კავშირის შეცდომა.';
      searchBtn.disabled = false;
      searchBtn.textContent = 'ხელახლა ძიება';
    }
  };

  document.body.appendChild(script);
}

function showResults(guests) {
  results.innerHTML = '';

  searchBtn.textContent = 'სახელის ძიება';

  if (guests.length === 0) {
    status.textContent = 'სამწუხაროდ, ასეთი სახელი ვერ მოიძებნა.';
    return;
  }

  status.textContent = 'აირჩიეთ თქვენი სახელი და გვარი:';

  guests.forEach(guest => {
    const item = document.createElement('div');
    item.className = 'result-item';
    item.textContent = guest.fullName;

    item.addEventListener('click', () => {
      selectGuest(guest);
    });

    results.appendChild(item);
  });
}

function selectGuest(guest) {
  results.innerHTML = '';
  status.textContent = '';

  guestName.textContent = guest.fullName;
  tableNumber.textContent = guest.tableNumber;

  showTablePin(guest.tableNumber);

  selectedGuest.classList.remove('hidden');

  input.value = guest.fullName;
  clearBtn.style.display = 'block';

  searchBtn.disabled = false;
  searchBtn.textContent = 'სახელის ძიება';

  setTimeout(() => {
    selectedGuest.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }, 100);
}

// გასუფთავება
clearBtn.addEventListener('click', () => {
  input.value = '';
  results.innerHTML = '';
  selectedGuest.classList.add('hidden');
  status.textContent = '';

  clearBtn.style.display = 'none';

  searchBtn.disabled = false;
  searchBtn.textContent = 'სახელის ძიება';

  document.getElementById('tablePin').hidden = true;

  requestId++;
  input.focus();
});

// დარბაზის რუკაზე მაგიდის მონიშვნა
function showTablePin(tableNumber) {
  const pin = document.getElementById('tablePin');
  const position = tablePositions[Number(tableNumber)];

  if (!position) {
    pin.hidden = true;
    return;
  }

  pin.style.left = position[0] + '%';
  pin.style.top = position[1] + '%';
  pin.hidden = false;
}
