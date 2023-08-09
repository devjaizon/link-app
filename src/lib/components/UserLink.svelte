<script>
    export let icon = 'default'
    export let url = 'foo'
    export let title = 'title'
</script>

<a href={url} class="">
    <img src={`/${icon}.png`} alt={icon} width="32" height="32" class="" />
    <span class="">{title}</span>
</a>
