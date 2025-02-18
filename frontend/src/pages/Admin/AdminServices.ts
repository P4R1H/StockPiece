export const admin_login = async (username: string, password: string) => {
    try {
        const response = await fetch('/api/v1/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error(`HTTP error, status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        return { success: true, data }; 
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to login");
    }
}

export const admin_logout = async () => {
    try {
        const response = await fetch('/api/v1/admin/logout', {
            method: 'POST', 
            credentials: "include", 
            headers: {'Content-Type' : 'application/json'}
        });

        if (!response.ok) {
            throw new Error(`HTTP error, status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to logout");
    }
}

export const add_character_stock = async (name: string, initialValue: number, imageURL: File, tickerSymbol : string) => {
    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('initialValue', initialValue.toString());
        formData.append('imageURL', imageURL);
        formData.append('tickerSymbol', tickerSymbol);

        const response = await fetch('/api/v1/admin/add-character-stock', {
            method: 'POST',
            credentials: "include",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error, status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to add character stock");
    }
}

export const remove_character_stock = async (id: string) => {
    try {
        const response = await fetch('/api/v1/admin/remove-character-stock', {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: id
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `HTTP error, status: ${response.status}`);
        }
        return { success: true, data };
    } catch (error) {
        console.error('Remove stock error:', error);
        throw new Error(error instanceof Error ? error.message : "Failed to remove character stock");
    }
}

export const add_admin_user = async (username: string, password: string) => {
    try {
        const response = await fetch('/api/v1/admin/add-admin', {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error(`HTTP error, status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to add admin");
    }
}