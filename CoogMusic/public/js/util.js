<script>

    function pad2(n) {
        return n.length == 2 ? n : "0" + n;
    }

    function length_prettify(song_len) {
        var hour = Math.floor(song_len / 60).toString();

        var min = Math.floor(song_len % 60).toString();
        min = (hour === "0") ? min : pad2(min);

        var sec = pad2(Math.floor(((song_len - Math.floor(song_len)) * 60)).toString());

        return hour === "0" ? `${min}:${sec}` : `${hour}:${min}:${sec}`;
    }

    module.exports = {
        length_prettify: length_prettify
    };

</script>