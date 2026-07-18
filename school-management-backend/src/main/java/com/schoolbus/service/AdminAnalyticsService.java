package com.schoolbus.service;

import com.schoolbus.dto.response.AnalyticsOverviewResponse;
import com.schoolbus.entity.enums.BusStatus;
import com.schoolbus.entity.enums.TripStatus;
import com.schoolbus.util.SecurityUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Aggregated academic + fleet analytics for the admin dashboard. */
@Service
@Transactional(readOnly = true)
public class AdminAnalyticsService {

    @PersistenceContext
    private EntityManager em;

    public AnalyticsOverviewResponse overview() {
        Long sid = SecurityUtils.getCurrentSchoolId();
        Instant since = Instant.now().minus(30, ChronoUnit.DAYS);

        long totalStudents = count("select count(s) from Student s where s.school.id=:sid and s.active=true", sid);
        long totalTeachers = count("select count(t) from Teacher t where t.school.id=:sid and t.active=true", sid);
        long driversOnline = count("select count(d) from Driver d where d.school.id=:sid and d.online=true", sid);
        long activeBuses = em.createQuery(
                        "select count(b) from Bus b where b.school.id=:sid and b.status=:st", Long.class)
                .setParameter("sid", sid).setParameter("st", BusStatus.ACTIVE).getSingleResult();

        long tripsTotal = em.createQuery(
                        "select count(t) from Trip t where t.school.id=:sid and t.actualStart>=:since", Long.class)
                .setParameter("sid", sid).setParameter("since", since).getSingleResult();
        long tripsCompleted = em.createQuery(
                        "select count(t) from Trip t where t.school.id=:sid and t.actualStart>=:since and t.status=:st",
                        Long.class)
                .setParameter("sid", sid).setParameter("since", since).setParameter("st", TripStatus.COMPLETED)
                .getSingleResult();
        long studentsTransported = em.createQuery(
                        "select coalesce(sum(t.studentsPicked),0) from Trip t where t.school.id=:sid and t.actualStart>=:since",
                        Long.class)
                .setParameter("sid", sid).setParameter("since", since).getSingleResult();
        double onTimePercent = tripsTotal == 0 ? 0.0 : Math.round(tripsCompleted * 1000.0 / tripsTotal) / 10.0;

        BigDecimal feesInvoiced = em.createQuery(
                        "select coalesce(sum(f.amount),0) from FeeInvoice f where f.school.id=:sid", BigDecimal.class)
                .setParameter("sid", sid).getSingleResult();
        BigDecimal feesCollected = em.createQuery(
                        "select coalesce(sum(f.paidAmount),0) from FeeInvoice f where f.school.id=:sid", BigDecimal.class)
                .setParameter("sid", sid).getSingleResult();
        BigDecimal feesOutstanding = feesInvoiced.subtract(feesCollected).max(BigDecimal.ZERO);

        Double examAvg = em.createQuery(
                        "select avg(r.marksObtained / e.maxMarks * 100) from ExamResult r join r.exam e "
                                + "where r.school.id=:sid and e.maxMarks > 0", Double.class)
                .setParameter("sid", sid).getSingleResult();
        double examAveragePercent = examAvg == null ? 0.0 : Math.round(examAvg * 10.0) / 10.0;

        return new AnalyticsOverviewResponse(totalStudents, totalTeachers, activeBuses, driversOnline,
                tripsTotal, tripsCompleted, onTimePercent, studentsTransported,
                feesInvoiced, feesCollected, feesOutstanding, examAveragePercent, attendanceTrend(sid));
    }

    private List<AnalyticsOverviewResponse.DayCount> attendanceTrend(Long sid) {
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        LocalDate from = today.minusDays(6);
        Map<String, long[]> byDay = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(today); d = d.plusDays(1)) {
            byDay.put(d.toString(), new long[2]);
        }
        List<Object[]> rows = em.createQuery(
                        "select c.attendanceDate, upper(c.status), count(c) from ClassAttendance c "
                                + "where c.school.id=:sid and c.attendanceDate>=:from group by c.attendanceDate, upper(c.status)",
                        Object[].class)
                .setParameter("sid", sid).setParameter("from", from).getResultList();
        for (Object[] row : rows) {
            String day = row[0].toString();
            String status = String.valueOf(row[1]);
            long n = ((Number) row[2]).longValue();
            long[] slot = byDay.get(day);
            if (slot == null) {
                continue;
            }
            if ("PRESENT".equals(status) || "LATE".equals(status)) {
                slot[0] += n;
            } else if ("ABSENT".equals(status)) {
                slot[1] += n;
            }
        }
        List<AnalyticsOverviewResponse.DayCount> trend = new ArrayList<>();
        byDay.forEach((day, slot) -> trend.add(new AnalyticsOverviewResponse.DayCount(day, slot[0], slot[1])));
        return trend;
    }

    private long count(String jpql, Long sid) {
        return em.createQuery(jpql, Long.class).setParameter("sid", sid).getSingleResult();
    }
}
