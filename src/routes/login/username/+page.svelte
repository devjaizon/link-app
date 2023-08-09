<script lang="ts">
    import AuthCheck from '$lib/components/AuthCheck.svelte'
    import { db, user, userData } from '$lib/firebase'
    import { doc, getDoc, writeBatch } from 'firebase/firestore'

    let username = ''
    let loading = false
    let isAvailable = false
    let debounceTimer: NodeJS.Timeout

    const re = /^(?=[a-zA-Z0-9._]{3,16}$)(?!.*[_.]{2})[^_.].*[^_.]$/

    $: isValid =
        username?.length > 4 && username.length < 16 && re.test(username)
    $: isTouched = username.length > 0
    $: isTaken = isValid && !isAvailable && !loading

    const checkAvailability = async () => {
        isAvailable = false
        loading = true

        clearTimeout(debounceTimer)

        debounceTimer = setTimeout(async () => {
            console.log('checking availability of ', username.toLowerCase())

            const ref = doc(db, 'usernames', username.toLowerCase())
            const exists = await getDoc(ref).then((doc) => doc.exists())

            isAvailable = !exists
            loading = false
        }, 1000)
    }

    const confirmUsername = async () => {
        console.log('Confirming username', username.toLowerCase())
        const batch = writeBatch(db)

        batch.set(doc(db, 'usernames', username.toLowerCase()), {
            uid: $user?.uid,
        })
        batch.set(doc(db, 'users', $user!.uid), {
            username: username.toLowerCase(),
            photoURL: $user?.photoURL ?? null,
            published: true,
            bio: 'I am I!!',
            links: [
                {
                    title: 'Test',
                    url: 'https://kung.foo',
                    icon: 'custom',
                },
            ],
        })

        await batch.commit()
    }
</script>

<AuthCheck>
    {#if $userData?.username}
        <p>
            Your username is <span>@{$userData.username}</span>
        </p>
        <p>(Usernames cannot be changed)</p>
        <a class="btn" href="/login/photo">Upload profile image</a>
    {:else}
        <form
            action=""
            class="w-2/5"
            on:submit|preventDefault={confirmUsername}
        >
            <input
                type="text"
                placeholder="Username"
                class="input w-full"
                bind:value={username}
                on:input={checkAvailability}
                class:input-error={!isValid && isTouched}
                class:input-warning={isTaken}
                class:input-success={isValid && isAvailable && !loading}
            />
            <div class="my-4">
                {#if loading}
                    <p class="text-secondary text-sm">
                        Check availability of @{username}...
                    </p>
                {/if}
                {#if !isValid && isTouched}
                    <p class="text-error text-sm">
                        ... must be 4-16 characters long, alphanumeric only!
                    </p>
                {/if}
                {#if isValid && !loading && !isAvailable}
                    <p class="text-warning text-sm">
                        @{username} is not available
                    </p>
                {/if}
            </div>
            {#if !loading && isAvailable && isTouched && !isTaken && isValid}
                <button class="btn btn-success"
                    >Confirm username @{username}</button
                >
            {/if}
        </form>
    {/if}
</AuthCheck>
