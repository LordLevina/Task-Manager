package de.bbq.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.File;
import java.lang.management.ManagementFactory;
import com.sun.management.OperatingSystemMXBean;
import java.util.HashMap;
import java.util.Map;

@RestController
public class SystemController {
    @GetMapping("/system")
    public Map<String, Long> getSystem() {
        Map<String, Long> map = new HashMap<>();

        Long storageTotalMb = new File("C:\\").getTotalSpace() / 1024 / 1024;
        Long storageFreeMb = new File("C:\\").getFreeSpace() / 1024 / 1024;

        map.put("storageTotalMb", storageTotalMb);
        map.put("storageFreeMb", storageFreeMb);

        OperatingSystemMXBean os = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
        Long memoryTotalMb = os.getTotalMemorySize() / 1024 / 1024;
        Long memoryFreeMb = os.getFreeMemorySize() / 1024 / 1024;
        Long cpuUtilization = Math.round(os.getCpuLoad() * 100);

        map.put("memoryTotalMb", memoryTotalMb);
        map.put("memoryFreeMb", memoryFreeMb);
        map.put("cpuUtilization", cpuUtilization);
        return map;
    }


}
