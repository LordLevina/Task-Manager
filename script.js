function updateSystem() {
  fetch("http://localhost:8080/system")
    .then((response) => response.json())
    .then((data) => {
      const cpuFill = document.getElementById("cpuFill");
      const memoryFill = document.getElementById("memoryFill");
      const storageFill = document.getElementById("storageFill");
      const maxHeight = 80;

      //-----------------CPU-------------------
      const height = (data.cpuUtilization / 100) * maxHeight;

      cpuFill.setAttribute("height", height);
      cpuFill.setAttribute("y", 190 - height);

      document.getElementById("cpuText").textContent =
        Math.round(data.cpuUtilization) + "%";

      //----------------Memory-----------------
      let memoryUsed = data.memoryTotalMb - data.memoryFreeMb;
      let memoryPercent = (memoryUsed / data.memoryTotalMb) * 100;

      const memoryHeight = (memoryPercent / 100) * maxHeight;

      memoryFill.setAttribute("height", memoryHeight);
      memoryFill.setAttribute("y", 260 - memoryHeight);

      document.getElementById("memoryText").textContent =
        Math.round(memoryPercent) + "%";

      //---------------Storage-----------------
      let storageUsed = data.storageTotalMb - data.storageFreeMb;
      let storagePercent = (storageUsed / data.storageTotalMb) * 100;

      const storageHeight = (storagePercent / 100) * maxHeight;

      storageFill.setAttribute("height", storageHeight);
      storageFill.setAttribute("y", 190 - storageHeight);

      document.getElementById("storageText").textContent =
        Math.round(storagePercent) + "%";
    });
}
updateSystem();
setInterval(updateSystem, 100);
