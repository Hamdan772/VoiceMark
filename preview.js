// preview.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Add click handlers for the 'Start Recording' links
    const startButtons = document.querySelectorAll('.start-recording-btn');
    const launchNotice = document.getElementById('launch-notice');

    function showNotice(message) {
        if (!launchNotice) return;
        launchNotice.textContent = message;
        launchNotice.classList.remove('hidden');
    }

    function openApp(baseUrl) {
        window.location.href = `${baseUrl}/record`;
    }

    function probePort(baseUrl, onDone) {
        const probe = document.createElement('script');
        let settled = false;

        probe.src = `${baseUrl}/_next/static/chunks/webpack.js`;
        probe.async = true;

        const finish = (ok) => {
            if (settled) return;
            settled = true;
            probe.remove();
            onDone(ok);
        };

        probe.onload = () => finish(true);
        probe.onerror = () => finish(false);

        document.head.appendChild(probe);
        window.setTimeout(() => finish(false), 1200);
    }

    function findNextDevServer(onSuccess, onFailure) {
        const candidates = ['http://localhost:3000', 'http://localhost:3001'];
        let index = 0;

        function nextProbe() {
            if (index >= candidates.length) {
                onFailure();
                return;
            }

            const candidate = candidates[index++];
            probePort(candidate, (ok) => {
                if (ok) {
                    onSuccess(candidate);
                } else {
                    nextProbe();
                }
            });
        }

        nextProbe();
    }

    startButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showNotice('Launching VoiceMark app...');

            findNextDevServer(
                (baseUrl) => openApp(baseUrl),
                () => showNotice('Could not find a Next.js app on localhost:3000 or 3001. Run "npm run dev" in VoiceMark, then click Start Analysis again.')
            );
        });
    });
});
