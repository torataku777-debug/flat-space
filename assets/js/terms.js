// Terms of Service page JavaScript
// Fetch and display terms from Supabase

window.addEventListener('DOMContentLoaded', async () => {
    if (!window.supabase) {
        console.error('Supabase client not initialized');
        document.getElementById('terms-content').innerHTML = '利用規約の読み込みに失敗しました。';
        return;
    }

    try {
        const { data, error } = await supabase
            .from('terms')
            .select('content, updated_at')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            throw error;
        }

        if (data) {
            // Display the terms content
            document.getElementById('terms-content').innerHTML = data.content.replace(/\n/g, '<br>');

            // Display the last updated date
            const lastUpdated = new Date(data.updated_at);
            document.getElementById('last-updated').textContent =
                `最終更新日: ${lastUpdated.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}`;
        } else {
            document.getElementById('terms-content').innerHTML = '利用規約がまだ登録されていません。';
            document.getElementById('last-updated').textContent = '';
        }
    } catch (error) {
        console.error('Error fetching terms:', error);
        document.getElementById('terms-content').innerHTML =
            '利用規約の読み込みに失敗しました。<br>しばらくしてからもう一度お試しください。';
        document.getElementById('last-updated').textContent = '';
    }
});
