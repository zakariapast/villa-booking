// public/js/villa-detail.js

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const villaId = urlParams.get('id');
  
    if (!villaId) return;
  
    try {
      const villaRes = await fetch(`/api/villas/${villaId}`);
      const villa = await villaRes.json();
  
      if (villa && villa.name) {
        document.getElementById('villaName').textContent = villa.name;
        document.getElementById('villaLocation').textContent = villa.location;
        document.getElementById('villaDescription').textContent = villa.description;
        document.getElementById('villaImage').src = `/uploads/${villa.image}`;
  
        if (villa.mapsLink) {
          document.getElementById('villaMap').src = villa.mapsLink;
        }
      }
  
      const roomRes = await fetch(`/api/rooms?villaId=${villaId}`);
      const rooms = await roomRes.json();
  
      const roomsContainer = document.getElementById('roomsContainer');
      if (rooms && rooms.length > 0) {
        rooms.forEach(room => {
          const roomDiv = document.createElement('div');
          roomDiv.classList.add('room-card');
          roomDiv.innerHTML = `
            <h3>${room.name}</h3>
            <p>Price: ${room.price}</p>
            <p>${room.description}</p>
          `;
          roomsContainer.appendChild(roomDiv);
        });
      } else {
        roomsContainer.innerHTML = '<p>No rooms available.</p>';
      }
    } catch (err) {
      console.error('Error loading villa detail:', err);
    }
  
    document.getElementById('bookingForm').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const checkin = document.getElementById('checkin').value;
      const checkout = document.getElementById('checkout').value;
  
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ villaId, checkin, checkout })
        });
  
        if (res.ok) {
          alert('Booking successful!');
          document.getElementById('bookingForm').reset();
        } else {
          alert('Failed to book.');
        }
      } catch (err) {
        console.error('Booking error:', err);
      }
    });
  });
