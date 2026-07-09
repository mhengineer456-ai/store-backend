async function main() {
  try {
    const res = await fetch('wait/api/scans');
    console.log('Response status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Scans total count:', data.length);
      const rgpScans = data.filter(s => s.scan_type === 'rgp_entry');
      console.log('RGP scans count:', rgpScans.length);
      if (rgpScans.length > 0) {
        console.log('Sample RGP scan from API:', rgpScans[0]);
      }
    }
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

main();
