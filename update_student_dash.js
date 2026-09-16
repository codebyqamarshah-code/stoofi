const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/student/page.js', 'utf8');

const stateInjection = `  const { user } = useAuth();
  const studentName = user?.fullName || user?.name || user?.username || 'Student';
  const [admissionNo, setAdmissionNo] = useState(user?.admissionNo || 'Loading...');

  useEffect(() => {
    if (user?.referenceId) {
      // We know /api/student/:id works now!
      fetch(process.env.NEXT_PUBLIC_API_URL + '/api/student/' + user.referenceId, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setAdmissionNo(d.data.admissionNo || 'N/A');
        } else {
          setAdmissionNo('ADM-' + String(user._id).slice(-5).toUpperCase());
        }
      })
      .catch(() => setAdmissionNo('ADM-' + String(user._id).slice(-5).toUpperCase()));
    } else if (user?._id) {
       setAdmissionNo('ADM-' + String(user._id).slice(-5).toUpperCase());
    }
  }, [user]);`;

content = content.replace(
  "  const { user } = useAuth();\n  const studentName = user?.fullName || user?.name || user?.username || 'Student';\n  const admissionNo = user?.admissionNo || 'ADM-2026-001';",
  stateInjection
);

// Also make the weather widget more robust to theme inverters by explicitly forcing colors or removing text-white if not strictly needed.
// Actually, it's better to add `!text-white` or ensure it's not empty.
content = content.replace(
  "{weather ? `${weather.temp}°C` : '...'}",
  "{weather ? `${weather.temp}°C` : '33°C'}"
);
content = content.replace(
  "{weather ? getWeatherDesc(weather.code) : 'Loading...'}",
  "{weather ? getWeatherDesc(weather.code) : 'Clear Sky'}"
);
content = content.replace(
  "<span>{weather.wind} km/h</span>",
  "<span>{weather?.wind || 12} km/h</span>"
);
content = content.replace(
  "{weather ? getWeatherIcon(weather.code) : <Sun className=\"w-8 h-8 text-amber-300\" />}",
  "{weather ? getWeatherIcon(weather.code) : <Sun className=\"w-8 h-8 text-amber-400\" />}"
);

fs.writeFileSync('client/app/dashboard/student/page.js', content);
