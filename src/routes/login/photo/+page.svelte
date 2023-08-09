<script lang="ts">
    import { updated } from '$app/stores'
    import AuthCheck from '$lib/components/AnimatedRoute.svelte'
    import { user, userData, storage, db } from '$lib/firebase'
    import { doc, updateDoc } from 'firebase/firestore'
    import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

    let previewURL: string
    let uploading = false

    const upload = async (e: any) => {
        uploading = true
        const file = e.target.files[0]
        previewURL = URL.createObjectURL(file)

        const storageRef = ref(storage, `users/${$user!.uid}/profile.png`)
        const result = await uploadBytes(storageRef, file)
        const url = await getDownloadURL(result.ref)

        await updateDoc(doc(db, 'users', $user!.uid), { photoURL: url })
        uploading = false
    }
</script>

<AuthCheck>
    <h2 class="card-title">Upload a profile photo</h2>
    <form class="max-w-screen-md w-full">
        <div class="from-control w-full max-w-xs my-10 mx-auto text-center">
            <img
                src={previewURL ?? $userData?.photoURL ?? '/user.png'}
                alt="photoURL"
                width="256"
                height="256"
                class="mx-auto"
            />
            <label for="phtooURL" class="label">
                <span class="label-text"> Pick a file </span>
            </label>
            <input
                on:change={upload}
                type="file"
                name="photoURL"
                class="join-iten"
                accept="'image/png, image/jpeg, image/gif, image/webp"
            />
            {#if uploading}
                <p>Uploading...</p>
                <progress class="progress progress-info w-56-mt-6" />
            {/if}
        </div>
    </form>
</AuthCheck>
