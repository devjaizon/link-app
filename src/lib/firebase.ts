import { initializeApp } from 'firebase/app'
import { doc, getFirestore, onSnapshot } from 'firebase/firestore'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { derived, writable, type Readable } from 'svelte/store'

const firebaseConfig = {
    apiKey: 'AIzaSyCAmX90L8bY5pyST3HeRAJdAKXSAfe1ulA',
    authDomain: 'link-app-c1eaf.firebaseapp.com',
    projectId: 'link-app-c1eaf',
    storageBucket: 'link-app-c1eaf.appspot.com',
    messagingSenderId: '262475176834',
    appId: '1:262475176834:web:970ccfb544a5589b85cd9b',
    measurementId: 'G-8HL1QHGV0P',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const db = getFirestore()
export const auth = getAuth()
export const storage = getStorage()

// user config
const userStore = () => {
    let unsubscribe: () => void

    if (!auth || !globalThis.window) {
        console.warn('Auth is not initialized or not in browser!!')
        const { subscribe } = writable<User | null>(null)

        return { subscribe }
    }

    const { subscribe } = writable(auth?.currentUser ?? null, (set) => {
        unsubscribe = onAuthStateChanged(auth, (user) => {
            set(user)
        })

        return () => unsubscribe()
    })

    return { subscribe }
}

export const user = userStore()

// store
export const docStore = <T>(path: string) => {
    let unsubscribe: () => void
    const docRef = doc(db, path)

    const { subscribe } = writable<T | null>(null, (set) => {
        unsubscribe = onSnapshot(docRef, (snapshot) => {
            set((snapshot.data() as T) ?? null)
        })

        return () => unsubscribe()
    })

    return {
        subscribe,
        ref: docRef,
        id: docRef.id,
    }
}

// user data

interface UserData {
    username: string
    bio: string
    photoURL: string
    links: any[]
}

export const userData: Readable<UserData | null> = derived(
    user,
    ($user, set) => {
        if ($user) {
            return docStore<UserData>(`users/${$user.uid}`).subscribe(set)
        } else {
            set(null)
        }
    }
)
