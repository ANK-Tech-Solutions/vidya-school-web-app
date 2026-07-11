package com.schoolbus.dto.response;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PageResponseTest {

    @Test
    void mapsSpringPageMetadataAndContent() {
        Page<String> page = new PageImpl<>(List.of("one", "two"), PageRequest.of(1, 2), 5);

        PageResponse<String> response = PageResponse.from(page);

        assertEquals(List.of("one", "two"), response.content());
        assertEquals(1, response.page());
        assertEquals(2, response.size());
        assertEquals(5, response.totalElements());
        assertEquals(3, response.totalPages());
        assertFalse(response.first());
        assertFalse(response.last());
    }

    @Test
    void marksSinglePageResultsAsFirstAndLast() {
        Page<String> page = new PageImpl<>(List.of("only"), PageRequest.of(0, 10), 1);

        PageResponse<String> response = PageResponse.from(page);

        assertTrue(response.first());
        assertTrue(response.last());
    }
}
